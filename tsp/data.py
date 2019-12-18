from math import sqrt


class Spot:
    def __init__(self, x, y, name):
        self.x = x
        self.y = y
        self.name = name


def get_length(a, b):
    return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2))


def get_lengths_all(spots):
    lengths = []
    for a in spots:
        l = []
        for b in spots:
            if a != b:
                l.append(get_length(a, b))
            else:
                l.append(-1)
        lengths.append(l)
    return lengths


def get_names(spots):
    names = []
    for spot in spots:
        names.append(spot.name)
    return names


spots = [
    Spot(1, 2, "体育馆"),
    Spot(2, 3, "食堂"),
]
# lengths = get_lengths_all(spots)
# names = get_names(spots)
lengths = [[-1, 2, 5, 7], [2, -1, 8, 3], [5, 8, -1, 1], [7, 3, 1, -1]]
