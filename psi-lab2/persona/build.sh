#!/bin/bash

# Configurar el script para que salga si hay un error
set -o errexit

# Instalar dependencias
pip install -r ../requirements.txt

# Borrar datos de la base de datos
python manage.py flush --no-input

# Recopilar archivos estáticos
python manage.py collectstatic --no-input

# Aplicar migraciones
python manage.py migrate