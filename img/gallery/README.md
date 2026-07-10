# 上課剪影照片資料夾

把上課照片放進這個資料夾，然後到 `scripts/scripts.js` 的 `GALLERY` 陣列加一行：

```js
const GALLERY = [
    { src: 'img/gallery/photo1.jpg', caption: '一對一數學課程' },
];
```

- `caption` 是照片下方的說明文字，可以留空字串 `''`
- 建議照片壓縮到 500KB 以下，網頁載入比較快
- `GALLERY` 陣列是空的時候，網站上的「上課剪影」區塊會自動隱藏
