import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import User from './user.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'
// import fs from 'fs'

// 連線到 mongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('資料庫連線成功')
  })
  .catch((err) => {
    console.log(err)
  })

// 建立 express 網頁伺服器
const app = express()

// 將傳入的的 body 解析為 json 格式
app.use(express.json())
// 處理 express.json() 的錯誤，可能是 json 格式不對
// 處理 middleware 的錯誤 function 必須要直接放在下面，且要有四個參數
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: '資料格式錯誤',
  })
})

// app.請求方式(路徑，處理動作)
// req = request = 進來的
// res = response = 出去的
app.post('/user', async (req, res) => {
  try {
    const user = await User.create({
      account: req.body.account,
      email: req.body.email,
    })

    // res.status(201)
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: '',
      result: user,
    })
  } catch (err) {
    console.log(err)

    if (err.name === 'MongoServerError' && err.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號或信箱重複',
      })
    } else if (err.name === 'ValidationError') {
      const key = Object.keys(err.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.errors[key].message,
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤',
      })
    }
  }
})

app.get('/user', async (req, res) => {
  try {
    const users = await User.find()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: users,
    })
  } catch (err) {
    console.log(err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤',
    })
  }
})

app.get('/user/:id', async (req, res) => {
  // http://localhost:4000/user/1234
  // { id : 1234 }
  console.log(req.params)
  // http://localhost:4000/user?aaa=111&bbb=222
  // { aaa : 111 , bbb : 222 }
  console.log(req.query)
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('ID')
    }

    // const user = await User.findOne({ _id:req.params.id })
    const user = await User.findById(req.params.id)

    if (!user) {
      throw new Error('NOT FOUND')
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: user,
    })
  } catch (err) {
    console.log(err)
    // fs.writeFileSync('./err.json', JSON.stringify(err, Object.getOwnPropertyNames(err), 2))

    if (err.name === 'CastError' || err.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID格式錯誤',
      })
    } else if (err.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤',
      })
    }
  }
})

app.patch('/user/:id', async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('ID')
    }

    // new: true 設定回傳更新後的資料
    // runValidators: true 執行 schema 定義的驗證
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: user,
    })
  } catch (err) {
    console.log(err)

    if (err.name === 'CastError' || err.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID格式錯誤',
      })
    } else if (err.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到',
      })
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號或信箱重複',
      })
    } else if (err.name === 'ValidationError') {
      const key = Object.keys(err.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.errors[key].message,
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤',
      })
    }
  }
})

app.delete('/user/:id', async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('ID')
    }

    await User.findOneAndDelete(req.params.id).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
    })
  } catch (err) {
    console.log(err)

    if (err.name === 'CastError' || err.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID格式錯誤',
      })
    } else if (err.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤',
      })
    }
  }
})

app.listen(process.env.PORT || 4000, () => {
  console.log('伺服器啟動')
})
