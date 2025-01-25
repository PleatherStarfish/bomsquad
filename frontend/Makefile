.PHONY: build-styles

build-styles:
	cd .. && cd backend/static/css/tailwind && ./tailwindcss -i ../tailwind.css -o ../styles.css --minify && cp ../styles.css ../../../../frontend/src/styles/

cp-bundle:
	cd .. && cp frontend/build/main.bundle.js backend/static/js/main.bundle.js && cp frontend/build/main.bundle.js.gz backend/static/js/main.bundle.js.gz

