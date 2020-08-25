# Едем на матч! API
 
Пара слов зачем эта API
 
## Авторизация
 
### `POST /auth`
 
Авторизует пользователя по номеру телефона и паролю (либо коду из смс)

status = 201, если все ок, status = 401, если авторизация не удалась (тогда token = null)
 
Request
```
{
    "phone": "9831234567"
}
```
 
Response
```
{
	"status": 201,
    "token": "23uigejwrfhlakjdshfjaksdhfjaksdfh"
}
```

## Пользователи
 
### `GET /user/:token`

Вернуть пользовательские данные (текущего пользователя)
(если мы в дальнейшем захотим получать данные других пользователей (короче чтобы можн было смотреть профили других пользователей), то с существующем api это сделать не получится)

Response
```
{
    "name": "Vovan",
    "last_name": "Kreed",
    "middle_name": "nulldsa",
    "phone": "9000000010",
    "email": "dsa@dsa.ds",
    "avatar": "http://img.blabla.com/234u823tuiof",
    "bio": "ffffff",
    "review": 3.5,
    "car": {
        "name": "Ford Focus",
        "year": "2020",
        "photo": "http://img.blabla.com/234u823tuiof"
    },
    "status": 200  (или 204, если "name" == null, или 404, если токен неверный)
}
```

### `PUT /user/:token`

Изменить пользовательские данные

ПОТОМ ПЕРЕИМЕНОВАТЬ middle_name НА adress

Request (все поля могут быть null) (или не быть вообще)
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
 
## Поездки

### `POST /:token/carpools`

Создать новую поездку
Вернуть ошибку если в профиле пользователя не заполнена тачка

Request 
```
{
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

### `GET /carpools`

Вернуть все поездки

Response
```
[
    {
        "carpool_id": "fb13ac52-8599-5b66-9112-95084831e337",
        "location": null,
        "seats_total": 1,
        "owner": {
            "name": "Анатолий",
            "last_name": "Игнатенко",
            "review": 0
        }
    }
]
```

### `DELETE /:token/carpools/:id`

Удалить поездку

### `GET /carpools/:id`

Вернуть конкретную поездку по id

Response
```
{
    "match_time": "2020-07-28T12:36:00.000Z",
    "visitor_team_name": "Ак Барс",
    "visitor_team_logo": "http://img.blabla.com/234u823tuiof",
    "seats_total": 1,
    "owner": {
        "name": "Анатолий",
        "last_name": "Игнатенко",
        "review": 0
    }
}
```

### `POST /:token/carpools/:id/passengers/:user_id`

Подтвердить заявку (добавить) пользователя в карпул

Response (если пользователь добавлен в карпул (или был добавлен ранее))
```
{
    "status": 200
}
```

или

Response (пользователь не добавлен в карпул т.к. там нет мест)
```
{
    "status": 405
}
```

### `DELETE /:token/carpools/:id/passengers/:user_id`

Запрос для пассажира чтобы отказаться от поездки
Запрос для водителя чтобы удалить пассажира из карпула или отказать в заявке

### `GET /:token/carpools/:id/passengers`

Получение списка пассажиров конкретного карпула

Запрос для водителя
Проверить, является ли пользователь владельцем карпула

Response
```
{
    "passengers": [
        {
            "name": null,
            "phone": "9000000047",
            "review": null
        },
        {
            "name": null,
            "phone": "9000000045",
            "review": null
        }
    ],
    "status": "200"
}
```

или

Response (если у пользователя нет прав (это не владелец карпула))
```
{
    "status": 403
}
```

### `GET /:token/carpools/:id/requests`

Получение всех неподтвержденных заявок в карпул

Response
```
[
    {
        "id": 1,
        "user_id": "b57ccb0e-e6f7-52ea-a338-6500ace4c567",
        "carpool_id": "87adf1ae-0cf8-5acf-b2e1-b915d76fc26e",
        "approved": false,
        "createdAt": "2020-07-29T12:58:44.331Z",
        "updatedAt": "2020-07-29T13:02:15.667Z"
    }
]
```

### `POST /carpools/:id/requests/:user_id`

Запрос (отправить заявку в карпул) для всех чтобы поехать

## Свободные пассажиры на конкретный матч

Пассажиры, которые хотят поехать на матч, но еще не нашли попутчика (водителя)
Нужно для того, чтобы водители могли приглашать пассажиров в свой карпул

### `POST /:token/passengers`

Добавление пассажира

Request
```
{
    "match_id": 1
}
```

### `GET /passengers/:match_id`

Получение списка свободных пассажиров

Response
```
[
    {
        "name": null,
        "phone": "+79502156696",
        "review": 0
    },
    ....
    {
        "name": null,
        "phone": "9000000053",
        "review": 4.25
    }
]
```

## Отзывы

### `GET /carpools/:id/review`

Получение оценок по поездке

Response
```
{
	rate: 5,
	Review: text
}
```

### `POST /carpools/:id/review/[:user_id]`

Поставить оценку за поездку

Request
```
{
	rate: 5,
	Review: text
}
```

## Временные и get all

### `GET /user`

Получение списка всех пользователей

Response
```
[
    {
        "id": 2,
        "token": "82dbb21c-882e-54a6-b7a3-86a8fe8a980c",
        "name": null,
        "last_name": null,
        "middle_name": null,
        "phone": "+79502156696",
        "email": null,
        "bio": null,
        "review": 0,
        "counter_trip": 0,
        "createdAt": "2020-08-21T11:09:16.992Z",
        "updatedAt": "2020-08-21T11:09:17.609Z"
    },
    ......
    {
        "id": 1,
        "token": "824dac23-dcf5-597a-85f7-b04442f36c94",
        "name": null,
        "last_name": null,
        "middle_name": null,
        "phone": "9000000053",
        "email": null,
        "bio": null,
        "review": 4.25,
        "counter_trip": 4,
        "createdAt": "2020-08-20T12:14:49.279Z",
        "updatedAt": "2020-08-21T13:43:22.879Z"
    }
]
```

### `GET /car`

Получение списка всех машин

Response
```
[
    {
        "id": 1,
        "owner": "824dac23-dcf5-597a-85f7-b04442f36c94",
        "name": null,
        "year": null,
        "createdAt": "2020-08-20T12:14:50.210Z",
        "updatedAt": "2020-08-20T12:14:50.210Z"
    },
    ........
    {
        "id": 2,
        "owner": "82dbb21c-882e-54a6-b7a3-86a8fe8a980c",
        "name": null,
        "year": null,
        "createdAt": "2020-08-21T11:09:18.211Z",
        "updatedAt": "2020-08-21T11:09:18.211Z"
    }
]
```

### `GET /requests`

Получение списка всех заявок

Response
```
[
]
```

### `GET /region`

Получение списка районов

Response
```
[
    {
        "name": "Балашиха"
    },
    .......
    {
        "name": "Мытищи"
    }
]
```

### `GET /matches`

Получение списка ближайших матчей

Response
```
[
    {
        "id": 1,
        "time": "2020-09-03T16:30:00.000Z",
        "visitor_team_name": "Сибирь",
        "visitor_team_logo": "/media/teams/sibir_rus.png"
    },
    .........
    {
        "id": 6,
        "time": "2020-09-27T15:30:00.000Z",
        "visitor_team_name": "Металлург Мг",
        "visitor_team_logo": "/media/teams/metallurg_mg_2020.png"
    }
]
```

### `GET /passengers`

Получение списка всех свободных пассажиров

Response
```
[
    {
        "id": 1,
        "match_id": 1,
        "user_id": "82dbb21c-882e-54a6-b7a3-86a8fe8a980c",
        "createdAt": "2020-08-25T12:36:09.109Z",
        "updatedAt": "2020-08-25T12:36:09.109Z"
    },
    {
        "id": 2,
        "match_id": 1,
        "user_id": "824dac23-dcf5-597a-85f7-b04442f36c94",
        "createdAt": "2020-08-25T12:53:06.963Z",
        "updatedAt": "2020-08-25T12:53:06.963Z"
    }
]
```