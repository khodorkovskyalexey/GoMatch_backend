# Едем на матч! API
 
Пара слов зачем эта API
 
## Авторизация
 
### `POST /auth`
 
Авторизует пользователя по номеру телефона и паролю (либо коду из смс)

status = 201, если все ок, status = 401, если авторизация не удалась (тогда token = null)
 
Request
```
{
    "phone": "9831234567",
    "code": "91327"
}
```
 
Response
```
{
	"status": 201,
    "token": "23uigejwrfhlakjdshfjaksdhfjaksdfh"
}
```
или
```
{
	"status": 401,
	"token": null
}
```

### `POST /auth/register`
 
Отправка смс пользователю (регистрация)

Токен не передается т.к. пользователь вводит код на фронте и далее следует запрос POST /auth
 
Request
```
{
    "phone": "9831234567"
}
```

### `DELETE /auth/:token`
 
Удаляет текущую сессия (разлогинивает)
 
## Матчи (скорее всего этого эндпойнта не будет)

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
 
### `GET /user/:token`

Вернуть пользовательские данные (текущего пользователя)
(если мы в дальнейшем захотим получать данные других пользователей (короче чтобы можн было смотреть профили других пользователей), то с существующем api это сделать не получится)

Response
```
{
	"id": 1,
	"token": "123e4567-e89b-12d3-a456-426652340000",
	"name": "Ivan",
	"last_name": “Ignatenko”,
	"middle_name": “Alexandrovich”,
	"phone": "95098712312",
	"email": ”ivanignatenko28@gmail.com”,
	"avatar": "http://img.blabla.com/234u823tuiof",
    "bio": “asdasdlaskldaskld … (150 letters)”,
	"review": 4.9,
	"count_trip": 10,
    "createdAt": "2020-07-27T16:05:06.707Z",
    "updatedAt": "2020-07-27T16:05:06.707Z",
	"car": {
		"id": 2,
		"owner": "123e4567-e89b-12d3-a456-426652340000",
		"name": “Ford Focus”,
		"year": 2020,
		"photo": "http://img.blabla.com/234u823tuiof",
        "createdAt": "2020-07-27T16:05:06.707Z",
        "updatedAt": "2020-07-27T16:05:06.707Z"
    }
}
```

### `PUT /user/:token`

Изменить пользовательские данные

(убрал из реквеста токен и телефон т.к. это типо константа)

Request (все поля, кроме car, могут быть null) (или не быть вообще)
```
{
	"name": "Ivan",
	"last_name": “Ignatenko”,
	"middle_name": “Alexandrovich”,
	"email": ”ivanignatenko28@gmail.com”,
	"avatar": "http://img.blabla.com/234u823tuiof",
	"car": {
		"name": “Ford Focus”, 
		"year": 2020,
		"photo": "http://img.blabla.com/234u823tuiof",
    },
    "bio": “asdasdlaskldaskld … (150 letters)”
}
```

Минимальный request (если нет car, то работать не будет)
```
{
	"car": {}
}
```
 
## Поездки

### `POST /carpools`

Создать новую поездку
Вернуть ошибку если в профиле пользователя не заполнена тачка (защиты от дурака нет)

Request 
```
{
	"owner": "23uige-jwrf-hlak-jdshfja-ksdfh",
	"match_time": "2020-07-28T12:36:00.000Z",
	"visitor_team_name": "Ак Барс",
    "visitor_team_logo": "http://img.blabla.com/234u823tuiof",
	"location": "Нефтяники, ул. Малунцева",
	"seats_total": 4
}
```

Response (карпул создан, все ок)
```
{
	"status": 201,
	"carpool_id": "2354ge-jwrf-h6ak-jdshhja-knd5h"
}
```

Response (если не заполнена тачка)
```
{
	"status": 403,
	"carpool_id": null
}
```

### `DELETE /carpools/:id`

Удалить поездку

### `GET /carpools`

Вернуть все поездки

Response
```
[
    {
        "id": 3,
        "carpool_id": "87adf1ae-0cf8-5acf-b2e1-b915d76fc26e",
        "owner": "b57ccb0e-e6f7-52ea-a338-6500ace4c567",
        "match_time": "2020-07-28T12:36:00.000Z",
        "visitor_team_name": "Ак Барс",
        "visitor_team_logo": "http://img.blabla.com/234u823tuiof",
        "location": "Нефтяники, ул. Малунцева",
        "seats_total": 4,
        "createdAt": "2020-07-28T18:59:05.475Z",
        "updatedAt": "2020-07-28T18:59:34.968Z"
    }
]
```

### `GET /carpools/:id`

Вернуть конкретную поездку по id

Response
```
{
    "id": 3,
    "carpool_id": "87adf1ae-0cf8-5acf-b2e1-b915d76fc26e",
    "owner": "b57ccb0e-e6f7-52ea-a338-6500ace4c567",
    "match_time": "2020-07-28T12:36:00.000Z",
    "visitor_team_name": "Ак Барс",
    "visitor_team_logo": "http://img.blabla.com/234u823tuiof",
    "location": "Нефтяники, ул. Малунцева",
    "seats_total": 4,
    "createdAt": "2020-07-28T18:59:05.475Z",
    "updatedAt": "2020-07-28T18:59:34.968Z"
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