# WakuLaw — common commands. Run `make help` for a list.

.DEFAULT_GOAL := help
API_DIR := apps/api
WEB_DIR := apps/web
VENV := $(API_DIR)/.venv
PYTHON := $(shell command -v python3.13 || command -v python3.12 || command -v python3.11 || command -v python3)

.PHONY: help setup setup-api setup-web api web test test-api build lint docker-up docker-down docker-logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: setup-api setup-web ## Install backend and frontend dependencies

setup-api: ## Create venv and install backend dependencies
	cd $(API_DIR) && $(PYTHON) -m venv .venv && .venv/bin/pip install --upgrade pip -q && .venv/bin/pip install -r requirements.txt

setup-web: ## Install frontend dependencies
	cd $(WEB_DIR) && npm install

api: ## Run the backend (http://localhost:8000, docs at /docs)
	cd $(API_DIR) && .venv/bin/python -m uvicorn app.main:app --reload --port 8000

web: ## Run the frontend dev server (http://localhost:5173)
	cd $(WEB_DIR) && npm run dev

test: test-api ## Run all tests

test-api: ## Run backend tests (fast, no model download)
	cd $(API_DIR) && .venv/bin/python -m pytest

build: ## Production build of the frontend (type-checks everything)
	cd $(WEB_DIR) && npm run build

lint: ## Lint the frontend
	cd $(WEB_DIR) && npm run lint

docker-up: ## Run the whole stack in Docker (app: :5173, api: :8000)
	docker compose -f docker/docker-compose.yml up --build

docker-down: ## Stop the Docker stack
	docker compose -f docker/docker-compose.yml down

docker-logs: ## Tail Docker stack logs
	docker compose -f docker/docker-compose.yml logs -f

clean: ## Remove local runtime artifacts (DB, uploads, index)
	rm -rf $(API_DIR)/wakulaw.db $(API_DIR)/uploads $(API_DIR)/storage $(API_DIR)/test_uploads $(API_DIR)/test_storage $(API_DIR)/test_wakulaw.db
