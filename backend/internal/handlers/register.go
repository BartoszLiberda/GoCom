package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/bartoszliberda/gocom-backend/internal/database"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	InviteCode string `json:"invite_code"`
	Email      string `json:"email"`
	Username   string `json:"username"`
	Password   string `json:"password"`
}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request"}`, http.StatusBadRequest)
		return
	}

	tag, err := database.DB.Exec(r.Context(), `
		UPDATE invites
		SET uses = uses + 1
		WHERE code = $1
			AND uses < max_uses
			AND expires_at > CURRENT_TIMESTAMP`,
		req.InviteCode,
	)

	if err != nil {
		http.Error(w, `{"error":"Database error"}`, http.StatusInternalServerError)
		return
	}

	if tag.RowsAffected() == 0 {
		http.Error(w, `{"error":"Invalid or expired invite code"}`, http.StatusBadRequest)
		return
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		http.Error(w, `{"error":"Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	var newUserID int
	err = database.DB.QueryRow(r.Context(), `
		INSERT INTO users (email, username, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id`,
		req.Email, req.Username, string(hashedBytes),
	).Scan(&newUserID)

	if err != nil {
		http.Error(w, `{"error":"Failed to create user. Email or username might be taken"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User registered successfully",
		"user_id": newUserID,
	})
}
