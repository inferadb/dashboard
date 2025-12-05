# Makefile for InferaDB Dashboard
# Provides convenient shortcuts for common npm commands
#
# Quick start:
#   make setup    - Install dependencies
#   make test     - Run all tests
#   make check    - Run all quality checks
#   make dev      - Start development server with hot reload
#
# Use 'make help' to see all available commands

.PHONY: help setup test test-ui test-coverage check format lint typecheck run dev build release clean reset preview ci

# Use mise exec if available, otherwise use system npm
NPM := $(shell command -v mise > /dev/null 2>&1 && echo "mise exec -- npm" || echo "npm")
PRETTIER := $(shell command -v mise > /dev/null 2>&1 && echo "mise exec -- prettier" || echo "prettier")

# Default target - show help
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "InferaDB Dashboard Commands"
	@echo ""
	@echo "Setup & Development:"
	@grep -E '^(setup|run|dev|build|release|preview|clean|reset):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Testing:"
	@grep -E '^test.*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Code Quality:"
	@grep -E '^(check|format|lint|typecheck):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "CI/CD:"
	@grep -E '^ci:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Use 'npm run <command> --help' for more options"
	@echo ""

setup: ## Install dependencies
	@echo "📦 Installing dashboard dependencies..."
	@$(NPM) install
	@echo "✅ Setup complete!"

test: ## Run all tests
	@echo "🧪 Running tests..."
	@$(NPM) run test -- --run

test-ui: ## Run tests with UI
	@echo "🧪 Running tests with UI..."
	@$(NPM) run test:ui

test-coverage: ## Run tests with coverage report
	@echo "📊 Running tests with coverage..."
	@$(NPM) run test:coverage

check: ## Run code quality checks (lint, typecheck)
	@echo "🔍 Running code quality checks..."
	@$(MAKE) lint
	@$(MAKE) typecheck
	@echo "✅ All checks passed!"

format: ## Format code with Prettier
	@echo "📝 Formatting code..."
	@$(PRETTIER) --write "src/**/*.{ts,tsx,css,json}" --log-level warn || true
	@echo "✅ Formatting complete!"

lint: ## Run ESLint
	@echo "🔍 Running linter..."
	@$(NPM) run lint

typecheck: ## Run TypeScript type checking
	@echo "🔍 Running type checker..."
	@$(NPM) run typecheck

run: ## Run the production server (requires build first)
	@echo "🚀 Starting production server..."
	@$(NPM) run start

dev: ## Start development server with hot reload
	@echo "🔄 Starting development server on port 5173..."
	@$(NPM) run dev

build: ## Build for development/testing
	@echo "🔨 Building dashboard..."
	@$(NPM) run build
	@echo "✅ Build complete!"

release: ## Build optimized production bundle
	@echo "🚀 Building production bundle..."
	@NODE_ENV=production $(NPM) run build
	@echo "✅ Production build complete!"

preview: ## Preview production build locally
	@echo "👀 Previewing production build..."
	@$(NPM) run preview

clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist .output .vinxi
	@echo "✅ Clean complete!"

reset: ## Full reset (clean + remove node_modules)
	@echo "⚠️  Performing full reset..."
	@rm -rf node_modules dist .output .vinxi package-lock.json
	@echo "✅ Reset complete! Run 'make setup' to reinstall."

ci: ## Run CI checks (lint, typecheck, test)
	@echo "🤖 Running CI checks..."
	@$(MAKE) lint
	@$(MAKE) typecheck
	@$(MAKE) test
	@echo "✅ CI checks passed!"
