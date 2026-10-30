package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/bartoszliberda/gocom-backend/internal/database"
	"github.com/bartoszliberda/gocom-backend/internal/middleware"
	"github.com/bartoszliberda/gocom-backend/internal/ws"
)

type MessageResponse struct {
	ID        int       `json:"id"`
	ChannelID int       `json:"channel_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`

	Sender struct {
		ID        int     `json:"id"`
		Username  string  `json:"username"`
		AvatarURL *string `json:"avatar_url"`
	} `json:"sender"`
}

type SendMessageRequest struct {
	Content string `json:"content"`
}

func GetChannelMessages(w http.ResponseWriter, r *http.Request) {
	channelIDStr := r.PathValue("channelID")
	channelID, err := strconv.Atoi(channelIDStr)
	if err != nil {
		http.Error(w, `{"error":"Invalid channel ID"}`, http.StatusBadRequest)
		return
	}

	rows, err := database.DB.Query(r.Context(), `
		SELECT m.id, m.channel_id, m.content, m.created_at, u.id, u.username, u.avatar_url
		FROM messages m
		JOIN users u ON m.user_id = u.id
		WHERE m.channel_id = $1
		ORDER BY m.created_at DESC
		LIMIT 50`,
		channelID,
	)

	if err != nil {
		http.Error(w, `{"error":"Failed to fetch messages"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []MessageResponse

	for rows.Next() {
		var msg MessageResponse
		if err := rows.Scan(
			&msg.ID,
			&msg.ChannelID,
			&msg.Content,
			&msg.CreatedAt,
			&msg.Sender.ID,
			&msg.Sender.Username,
			&msg.Sender.AvatarURL,
		); err != nil {
			http.Error(w, `{"error":"Error parsing messages"}`, http.StatusInternalServerError)
			return
		}
		messages = append(messages, msg)
	}

	if messages == nil {
		messages = []MessageResponse{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func SendMessage(w http.ResponseWriter, r *http.Request, hub *ws.Hub) {
	channelIDStr := r.PathValue("channelID")
	channelID, err := strconv.Atoi(channelIDStr)
	if err != nil {
		http.Error(w, `{"error":"Invalid channel ID"}`, http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, `"{error":"Unauthorized}"`, http.StatusUnauthorized)
		return
	}

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Content == "" {
		http.Error(w, `"{error":"Message content cannot be empty}"`, http.StatusBadRequest)
		return
	}

	var newMessageID int
	var createdAt time.Time
	err = database.DB.QueryRow(r.Context(), `
		INSERT INTO messages (channel_id, user_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`,
		channelID, userID, req.Content,
	).Scan(&newMessageID, &createdAt)

	if err != nil {
		http.Error(w, `{"error":"Failed to save message"}`, http.StatusInternalServerError)
		return
	}

	var username string
	var AvatarURL *string
	database.DB.QueryRow(r.Context(), `
		SELECT username, avatar_url
		FROM users
		WHERE id = $1`,
		userID,
	).Scan(&username, &AvatarURL)

	fullMessage := MessageResponse{
		ID:        newMessageID,
		ChannelID: channelID,
		Content:   req.Content,
		CreatedAt: createdAt,
	}

	fullMessage.Sender.ID = userID
	fullMessage.Sender.Username = username
	fullMessage.Sender.AvatarURL = AvatarURL

	if messageBytes, err := json.Marshal(fullMessage); err == nil {
		hub.Broadcast <- messageBytes
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(fullMessage)
}
