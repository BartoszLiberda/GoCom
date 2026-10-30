package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/bartoszliberda/gocom-backend/internal/database"
)

type Channel struct {
	ID         int    `json:"id"`
	CategoryID *int   `json:"category_id"`
	Name       string `json:"name"`
	Type       string `json:"type"`
}

type Category struct {
	ID       int       `json:"id"`
	Name     string    `json:"name"`
	Channels []Channel `json:"channels"`
}

func GetChannels(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	catRows, err := database.DB.Query(ctx, `
		SELECT id, name
		FROM channel_categories
		ORDER BY position ASC
	`)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch categories"}`, http.StatusInternalServerError)
		return
	}
	defer catRows.Close()

	categoryMap := make(map[int]*Category)
	var categories []Category

	for catRows.Next() {
		var cat Category
		if err := catRows.Scan(&cat.ID, &cat.Name); err != nil {
			http.Error(w, `{"error":"Error parsing categories"}`, http.StatusInternalServerError)
			return
		}
		cat.Channels = []Channel{}
		categoryMap[cat.ID] = &cat
		categories = append(categories, cat)
	}

	chanRows, err := database.DB.Query(ctx, `
		SELECT id, category_id, name, type
		FROM channels
		ORDER BY position ASC
	`)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch channels"}`, http.StatusInternalServerError)
		return
	}
	defer chanRows.Close()

	var unmappedChannels []Channel

	for chanRows.Next() {
		var ch Channel
		if err := chanRows.Scan(&ch.ID, &ch.CategoryID, &ch.Name, &ch.Type); err != nil {
			http.Error(w, `{"error":"Error parsing channels"}`, http.StatusInternalServerError)
			return
		}

		if ch.CategoryID != nil {
			if cat, exists := categoryMap[*ch.CategoryID]; exists {
				cat.Channels = append(cat.Channels, ch)
			}
		} else {
			unmappedChannels = append(unmappedChannels, ch)
		}
	}

	var finalCategories []Category
	for _, cat := range categories {
		finalCategories = append(finalCategories, *categoryMap[cat.ID])
	}

	response := map[string]interface{}{
		"categories":   finalCategories,
		"top_channels": unmappedChannels,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetChannel(w http.ResponseWriter, r *http.Request) {
	channelIDStr := r.PathValue("channelID")

	var ch Channel
	err := database.DB.QueryRow(r.Context(), `
		SELECT id, category_id, name, type 
		FROM channels 
		WHERE id = $1`,
		channelIDStr,
	).Scan(&ch.ID, &ch.CategoryID, &ch.Name, &ch.Type)

	if err != nil {
		http.Error(w, `{"error":"Channel not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ch)
}
