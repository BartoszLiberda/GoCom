package handlers

import (
	"context"
	"encoding/json"
	"math"
	"net/http"

	"github.com/bartoszliberda/gocom-backend/internal/database"
	"golang.org/x/crypto/bcrypt"
)

type SetupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func CheckSetupStatus(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	var count int

	err := database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		http.Error(w, `{"error":"Database Error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{
		"setup_required": count == 0,
	})
}

func PerformSetup(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	var err error

	var count int
	err = database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		http.Error(w, `{"error":"Database Error"}`, http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, `{"error":"Setup has already been completed"}`, http.StatusForbidden)
		return
	}

	var req SetupRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Email == "" || req.Password == "" {
		http.Error(w, `{"error":"Invalid Request Payload"}`, http.StatusBadRequest)
		return
	}

	var hashedPassword []byte
	hashedPassword, err = bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error":"Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	tx, err := database.DB.Begin(ctx)
	if err != nil {
		http.Error(w, `{"error":"Failed to start transaction"}`, http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	var roleID int
	err = tx.QueryRow(ctx, `
		INSERT INTO roles (name, position, permissions) 
		VALUES ($1, $2, $3) RETURNING id`,
		"Administrator", 0, math.MaxInt64,
	).Scan(&roleID)
	if err != nil {
		http.Error(w, `{"error":"Failed to create admin role"}`, http.StatusInternalServerError)
		return
	}

	var userID int
	err = tx.QueryRow(ctx, `
		INSERT INTO users (username, email, password_hash) 
		VALUES ($1, $2, $3) RETURNING id`,
		req.Username, req.Email, string(hashedPassword),
	).Scan(&userID)
	if err != nil {
		http.Error(w, `{"error":"Username or email already taken"}`, http.StatusBadRequest)
		return
	}

	_, err = tx.Exec(ctx, `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, userID, roleID)
	if err != nil {
		http.Error(w, `{"error":"Failed to assign role"}`, http.StatusInternalServerError)
		return
	}

	var categoryID int
	err = tx.QueryRow(ctx, `
		INSERT INTO channel_categories (name, position)
		VALUES ($1, $2) RETURNING id`,
		"Text Channels", 0,
	).Scan(&categoryID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create default category"}`, http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO channels (category_id, name, type, position) 
		VALUES ($1, $2, $3, $4)`,
		categoryID, "general", "text", 0,
	)
	if err != nil {
		http.Error(w, `{"error": "Failed to create default channel"}`, http.StatusInternalServerError)
		return
	}

	err = tx.Commit(ctx)
	if err != nil {
		http.Error(w, `{"error": "Failed to commit setup transaction"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Instance setup completed successfully!"}`))
}
