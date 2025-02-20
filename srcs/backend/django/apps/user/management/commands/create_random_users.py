import random
from django.core.management.base import BaseCommand
from user.models import AppUser
from faker import Faker

class Command(BaseCommand):
	def handle(self, *args, **kwargs):
		fake = Faker()
		created_users = 0

		while created_users < 8:
			username = fake.user_name()
			email = fake.email()

			user = AppUser.objects.create_user(
				username=username,
				email=email,
				password='123',
				avatar='default/default.jpg',
				last_seen=fake.date_time_this_year(),
				is_online=False,
				image_link=fake.url(),
				id_deleted=False
			)
			self.stdout.write(self.style.SUCCESS(f'User {username} created'))
			created_users += 1
