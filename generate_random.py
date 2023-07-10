import csv
import random

with open('random_points.csv', 'w', newline='') as csvfile:
    fieldnames = ['lng', 'lat']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for _ in range(1000):
        lng = random.uniform(-74.3, -73.7)
        lat = random.uniform(40.5, 40.9)
        writer.writerow({'lng': lng, 'lat': lat})
