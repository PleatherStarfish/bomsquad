.PHONY: build-styles

build-styles:
	cd backend/static/css/tailwind && ./tailwindcss -i ../tailwind.css -o ../styles.css --minify && cp ../styles.css ../../../../frontend/src/styles/

cp-bundle:
	cp frontned/build/main.js backend/static/js/