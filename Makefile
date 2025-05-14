run:
	bash -c "source .venv/bin/activate && python back-end/app.py &"
	cd front-end && npm run dev