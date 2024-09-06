// A golang webserve (using the gin framework) for mocking the upload of images
// This will be replaced by the actual Java backend.

package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	c := cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})

	r.Use(c)

	r.POST("/upload", func(c *gin.Context) {
		// Multipart form
		form, _ := c.MultipartForm()

		// There might be multiple files
		for _, files := range form.File {
			for _, file := range files {
				// Upload the file to specific dst.
				c.SaveUploadedFile(file, "data/"+file.Filename)
			}
		}

		c.String(http.StatusOK, fmt.Sprintf("files uploaded!"))
	})
	r.Run(":8080")
}
