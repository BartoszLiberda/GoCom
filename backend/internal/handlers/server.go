package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/bartoszliberda/gocom-backend/internal/database"
)

type ServerSettingsResponse struct {
	ServerName string `json:"server_name"`
}

func GetServerSettings(w http.ResponseWriter, r *http.Request) {
	var res ServerSettingsResponse

	err := database.DB.QueryRow(r.Context(), `
		SELECT server_name
		FROM server_settings
		LIMIT 1`,
	).Scan(&res.ServerName)

	if err != nil {
		http.Error(w, `{"error":"Server settings not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
