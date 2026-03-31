# Message API

Base URL: `http://localhost:3000/api/v1/messages`

Yeu cau dang nhap:
- Dung cookie `TOKEN_NNPTUD_C3` sau khi `POST /api/v1/auth/login`
- Hoac header `Authorization: Bearer <token>`

## 1. Lay toan bo tin nhan voi 1 user

`GET /api/v1/messages/:userId`

Tra ve toan bo message:
- `from = user hien tai` va `to = userId`
- `from = userId` va `to = user hien tai`

## 2. Gui tin nhan

`POST /api/v1/messages`

Body gui text:

```json
{
  "to": "USER_ID_NHAN",
  "messageContent": {
    "type": "text",
    "text": "Xin chao"
  }
}
```

Body gui file:

```json
{
  "to": "USER_ID_NHAN",
  "messageContent": {
    "type": "file",
    "text": "uploads/example.pdf"
  }
}
```

## 3. Lay message cuoi cung cua moi cuoc tro chuyen

`GET /api/v1/messages`

Tra ve message moi nhat cua tung user da nhan tin voi user hien tai.
