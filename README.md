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

### `POST /auth/register`
 
Отправка смс пользователю (регистрация)

Токен не передается т.к. пользователь вводит код на фронте и далее следует запрос POST /auth
 
Request
```
{
    phone: "9831234567"
}
```

### `DELETE /auth/:token`
 
Удаляет текущую сессия (разлогинивает)
 
## Матчи

### `GET /matches`

Список ближайших матчей 

Response
```
{
	matches: [
		{
			id: "123e4567-e89b-12d3-a456-426652340000"
			datetime: "01-01-2021 19:30",
			opponent: "АК Барс"
		},
		...
	]
}
```

## Пользователи
 
### `GET /user/:token`

Вернуть пользовательские данные (текущего пользователя)
(если мы в дальнейшем захотим получать данные других пользователей (короче чтобы можн было смотреть профили других пользователей), то с существующем api это сделать не получится)

Response
```
{
	token: "123e4567-e89b-12d3-a456-426652340000",
	name: "Ivan",
	last_name: “Ignatenko”,
	middle_name: “Alexandrovich”,
	phone: "95098712312",
	email: ”ivanignatenko28@gmail.com”,
	avatar: "http://img.blabla.com/234u823tuiof",
	car: {
		name: “Ford Focus”,
		year: 2020,
		photo: "http://img.blabla.com/234u823tuiof",
    },
    bio: “asdasdlaskldaskld … (150 letters)”,
	review: 4,9
}
```

### `PUT /user/:token`

Изменить пользовательские данные

(убрал из реквеста токен и телефон т.к. это типо константа)

Request (может содержать не все эти поля, достаточно одного, которое нужно изменить)
```
{
	name: "Ivan",
	last_name: “Ignatenko”,
	middle_name: “Alexandrovich”,
	email: ”ivanignatenko28@gmail.com”,
	avatar: "http://img.blabla.com/234u823tuiof",
	car: {
		name: “Ford Focus”, 
		year: 2020,
		photo: "http://img.blabla.com/234u823tuiof",
    },
    bio: “asdasdlaskldaskld … (150 letters)”
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