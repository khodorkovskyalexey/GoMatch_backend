# Едем на матч! API
 
Пара слов зачем эта API
 
## Авторизация
 
### `POST /auth`
 
Авторизует пользователя по номеру телефона и паролю (либо коду из смс)
 
Request
```
{
    phone: "9831234567",
    code: "91327"
}
```
 
Response
```
{
	status: 201 - (или 401)
    token: "23uigejwrfhlakjdshfjaksdhfjaksdfh"
}
```
 
### `DELETE /auth`
 
Удаляет текущую сессия (разлогинивает)

Request
```
{
	token: "23uigejwrfhlakjdshfjaksdhfjaksdfh"
}
```
 
## Матчи

### `GET /matches`

Список ближайших матчей 

Response
```
{
	"matches": [
		{
			"id": "123e4567-e89b-12d3-a456-426652340000"
			"datetime": "01-01-2021 19:30",
			"opponent": "АК Барс"
		},
		...
	]
}
```

## Пользователи
 
### `GET /user/:id`

Вернуть пользовательские данные

Response
```
{
    "id": "123e4567-e89b-12d3-a456-426652340000",
	"name": "Ivan",
	“Last_name” : “Ignatenko”,
	“Middle_name” : “Alexandrovich”,
	“phone": "95098712312",
	“Email”: ”ivanignatenko28@gmail.com”,
	"avatar": "http://img.blabla.com/234u823tuiof",
	“car”: {
		“name”: “Ford Focus”,
		“Year”: 2020,
		“Photo” : "http://img.blabla.com/234u823tuiof",
    },
    “Bio” : “asdasdlaskldaskld … (150 letters)”,
	    “Review” : “4,9”
    }
```

### `PUT /user/:id`

Изменить пользовательские данные

Request 
```
{
    "id": "123e4567-e89b-12d3-a456-426652340000",
	"name": "Ivan",
	“Last_name” : “Ignatenko”,
	“Middle_name” : “Alexandrovich”,
	“phone": "95098712312",
	“Email”: ”ivanignatenko28@gmail.com”,
	"avatar": "http://img.blabla.com/234u823tuiof",
	“car”: {
		“name”: “Ford Focus”, 
		“Year”: 2020,
		“Photo” : "http://img.blabla.com/234u823tuiof",
    },
    “Bio” : “asdasdlaskldaskld … (150 letters)”
    }
```

### `POST /user/:id`

Добавить пользовательские данные
Практически все может быть null, кроме name и phone

Request 
```
{
    "id": "123e4567-e89b-12d3-a456-426652340000",
	"name": "Ivan",
	“Last_name” : “Ignatenko”,
	“Middle_name” : “Alexandrovich”,
	“phone": "95098712312",
	“Email”: ”ivanignatenko28@gmail.com”,
	"avatar": "http://img.blabla.com/234u823tuiof",
	“car”: {
		“name”: “Ford Focus”, 
		“Year”: 2020,
		“Photo” : "http://img.blabla.com/234u823tuiof",
    },
    “Bio” : “asdasdlaskldaskld … (150 letters)”
    }
```
 
## Поездки

### `POST /carpools`

Создать новую поездку
Вернуть ошибку если в профиле пользователя не заполнена тачка

Request 
```
{
	"match_id": "123e4567-e89b-12d3-a456-426652340000",
	"location": "Нефтяники, ул. Малунцева",
	"time": "01-01-2021 18:30",
	"seats_total": 4,
}
```
 
### `DELETE /carpools/:id`

Удалить поездку

### `GET /carpools`

Вернуть все поездки

Response
```
{
	"carpools": [
		{
			"id": "123e4567-e89b-12d3-a456-426652340000",
			"owner": "Ivan",
			"avatar": "http://img.blabla.com/234u823tuiof",
			"location": "Нефтяники, ул. Малунцева",
			"time": "01-01-2021 18:30",
			"seats_total": 4,
			"seats_occupied": 1,
			"car": "Ford Focus",
		},
		...
	]
}
```

### `GET /carpools/:id`

Вернуть конкретную поездку по id

Response
```
{
	"id": "123e4567-e89b-12d3-a456-426652340000",
	"owner": "Ivan",
	"avatar": "http://img.blabla.com/234u823tuiof",
	"location": "Нефтяники, ул. Малунцева",
	"time": "01-01-2021 18:30",
	"seats_total": 4,
	"seats_occupied": 1,
	"car": "Ford Focus",
}
```

## `POST /carpools/:id/passengers`

Запрос для всех чтобы поехать

### `DELETE /carpools/:id/passengers/:user_id`

Запрос для пассажира чтобы отказаться от поездки
Запрос для водителя чтобы отказать пассажиру

### `GET /carpools/:id/passengers`

Запрос для водителя
Проверить, является ли пользователь владельцем карпула

Response
```
{
	"passengers": [
		{
			"name": "Alexey",
			"phone": "95098712312"
			“Review” : “4,9”
		}
	]
}
```

## Отзывы

### `GET /carpools/:id/review`

Получение оценок по поездке

Response
```
{
	Rate: 5,
	Review: text
}
```

### `POST /carpools/:id/review/[:user_id]`

Поставить оценку за поездку

Request
```
{
	Rate: 5,
	Review: text
}
```