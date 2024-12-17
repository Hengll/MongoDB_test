import { Schema, model } from 'mongoose'
import validator from 'validator'

const schema = new Schema({
  // 資料欄位名稱
  account: {
    // 資料型態
    type: String,
    // 必填
    require: [true, '帳號必填'],
    // 限制長度
    minLength: [4, '帳號最少 4 個字'],
    maxLength: [20, '帳號最多 20 個字'],
    // 欄位資料不能重複
    unique: true,
    // Regex
    match: [/^[A-Za-z0-9]+$/, '帳號只能是英數字'],
    // 自動使用 .trim() 去除空白
    trim: true,
  },
  email: {
    type: String,
    require: [true, '信箱必填'],
    unique: true,
    // 自訂驗證
    validate: {
      validator(value) {
        return validator.isEmail(value)
      },
      message: '信箱格式錯誤',
    },
  },
})

// 把結構轉成可以操作的 model 匯出
// model(collection名稱, schema)
// collecton 名稱使用英文複數
export default model('users', schema)
