from django.db import models

# Create your models here.

class Persona(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)

    class Meta:
        ordering = ['id']


    def __str__(self):
        return self.nombre