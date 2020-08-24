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

### `DELETE /:token/carpools/:id`

Удалить поездку

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

## Временно

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