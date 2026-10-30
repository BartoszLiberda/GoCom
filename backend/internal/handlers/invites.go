package handlers

import (
	"crypto/rand"
	"encoding/json"
	"math/big"
	"net/http"
	"time"

	"github.com/bartoszliberda/gocom-backend/internal/database"
	"github.com/bartoszliberda/gocom-backend/internal/middleware"
)

func GenerateRandomString(n int) (string, error) {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	ret := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt((int64(len(letters)))))
		if err != nil {
			return "", err
		}
		ret[i] = letters[num.Int64()]
	}
	return string(ret), nil
}

func CreateInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, `{"error":"Failed to generate code"}`, http.StatusUnauthorized)
		return
	}

	code, err := GenerateRandomString(8)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate code"}`, http.StatusInternalServerError)
		return
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	maxUses := 1

	_, err = database.DB.Exec(r.Context(), `
		INSERT INTO invites (code, creator_id, max_uses, expires_at)
		VALUES ($1, $2, $3, $4)`,
		code, userID, maxUses, expiresAt,
	)

	if err != nil {
		http.Error(w, `{"error":"Failed to save invite"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"code": code,
	})
}

func ValidateInvite(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")

	var isValid bool
	err := database.DB.QueryRow(r.Context(), `
		SELECT EXISTS(
			SELECT 1 FROM invites
			WHERE code = $1
				AND uses < max_uses
				AND expires_at > CURRENT_TIMESTAMP
		)`,
		code,
	).Scan(&isValid)

	if err != nil {
		http.Error(w, `{"error":"Database error"}`, http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{
		"valid": isValid,
	})
}
