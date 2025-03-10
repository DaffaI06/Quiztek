// @title           quiztekbe
// @version         1.0
// @description     Backend for Quiztek
// @host            localhost:3001
// @BasePath        /
package main

import (
	_ "github.com/DaffaI06/QuiztekBE/docs"
	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	httpSwagger "github.com/swaggo/http-swagger"
	"log"
)

func main() {
	if err := connectToDb(); err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	app := fiber.New()

	// Enable CORS
	// AllowOrigin is set to all, change when prod
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,PATCH,DELETE",
		AllowHeaders: "Content-Type, Authorization",
	}))

	app.Get("/swagger/*", adaptor.HTTPHandler(httpSwagger.WrapHandler))

	app.Get("/quiz", GetQuizzes)
	app.Get("/quiz/:id", GetQuiz)
	app.Post("/quiz/create", PostQuiz)
	app.Patch("/quiz/edit/:id", PatchQuiz)
	app.Delete("/quiz/delete/:id", DeleteQuiz)

	app.Get("/quiz/question/:id", GetQuestionsByQuizId)
	app.Get("/question/:id", GetQuestion)
	app.Post("/question/create/:id", PostQuestionByQuizId)
	app.Patch("/question/edit/:id", PatchQuestion)
	app.Delete("/question/delete/:id", DeleteQuestion)

	app.Post("/submission/attempt/:id", PostAttemptByQuizId)
	app.Put("/submission/answer/:id", PutAnswerByAttemptId)
	app.Get("/submission/latest/:id", GetLatestSubmissions)
	app.Get("/submission/:attemptid/:questionid", GetAnswer)
	app.Put("/submission/attempt/complete/:attemptid", CompleteAttempt)

	log.Fatal(app.Listen(":8080"))

}
