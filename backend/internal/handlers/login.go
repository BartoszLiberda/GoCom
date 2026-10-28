package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/bartoszliberda/gocom-backend/internal/database"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecretKey = []byte("")

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID       int    `json:"id"`
		Username string `json:"username"`
	} `json:"user"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Password == "" {
		http.Error(w, `{"error":"Invalid request Payload"}`, http.StatusBadRequest)
		return
	}

	var id int
	var username string
	var passworHash string

	err := database.DB.QueryRow(ctx, `
		SELECT id, username, password_hash
		FROM users
		WHERE email = $1`,
		req.Email,
	).Scan(&id, &username, &passworHash)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error":"Invalid email or passoword"}`, http.StatusUnauthorized)
			return
		}
		http.Error(w, `{"error":"Database error"}`, http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(passworHash), []byte(req.Password))
	if err != nil {
		http.Error(w, `{"error":"Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": id,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecretKey)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	res := LoginResponse{
		Token: tokenString,
	}
	res.User.ID = id
	res.User.Username = username

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
