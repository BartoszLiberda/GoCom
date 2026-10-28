package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/bartoszliberda/gocom-backend/internal/database"
	"github.com/bartoszliberda/gocom-backend/internal/middleware"
)

type UserResponse struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}

func GerMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, `{"error":"Server error retrieving user"}`, http.StatusInternalServerError)
		return
	}

	var res UserResponse
	var avatarURL *string

	err := database.DB.QueryRow(r.Context(), `
		SELECT id, username, email, avatar_url
		FROM users
		WHERE id = $1`,
		userID,
	).Scan(&res.ID, &res.Username, &res.Email, &avatarURL)

	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	if avatarURL != nil {
		res.AvatarURL = *avatarURL
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
