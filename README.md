Deployed: 13.236.116.163

Setup:
git clone
create .env in /quiztek, /quiztek/quiztekbe, /quiztek/quiztekfe
copy .env contents from https://docs.google.com/document/d/1DMBtRlKYzVJEwdxnBhbFqBd7W07mPR_q0ViWTbroBsM/edit?usp=sharing 
open terminal
cd to /quiztek
make sure docker is installed
> docker compose up

Latest commit before deadline had a rlly small error with env causing the be to fail completely :(
Now: commented out godotenv load cause it's already handled by docker compose
