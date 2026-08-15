# حساب‌طلا — محاسبه‌گر قیمت طلا (PWA)

یک اپلیکیشن وب پیشرو (PWA) برای محاسبه قیمت نهایی طلای ساخته‌شده بر اساس:
- قیمت هر گرم طلای ۱۸ عیار
- وزن طلا
- اجرت ساخت
- سود فروشنده
- مالیات بر ارزش افزوده (فقط روی اجرت + سود، طبق فرمول رسمی بازار طلا)

## ویژگی‌ها
- قابل نصب روی صفحه اصلی موبایل (Android / iOS) و دسکتاپ
- کار آفلاین بعد از اولین بازدید (Service Worker)
- محاسبه لحظه‌ای بدون نیاز به دکمه
- ورودی و خروجی با اعداد فارسی
- طراحی تیره با تم طلایی، راست‌چین و بهینه برای موبایل

## اجرای محلی
هر سرور استاتیک ساده کافیست، چون این پروژه فقط HTML/CSS/JS خام است:

```bash
python3 -m http.server 8000
# یا
npx serve .
```

سپس در مرورگر به آدرس `http://localhost:8000` بروید.

## ساختار پروژه
```
.
├── index.html
├── styles.css
├── app.js
├── manifest.json
├── service-worker.js
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    ├── apple-touch-icon.png
    └── favicon-32.png
```

## آپلود روی GitHub
```bash
git init
git add .
git commit -m "Initial commit: gold price calculator PWA"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

## انتشار رایگان با GitHub Pages
1. به تنظیمات ریپازیتوری بروید: **Settings → Pages**
2. زیر «Build and deployment» گزینه **Source** را روی **Deploy from a branch** بگذارید
3. شاخه (Branch) را `main` و پوشه را `/ (root)` انتخاب کنید و **Save** بزنید
4. بعد از چند دقیقه، سایت روی آدرسی شبیه زیر در دسترس خواهد بود:
   `https://<username>.github.io/<repo-name>/`

> نکته: چون `manifest.json` و `service-worker.js` از مسیرهای نسبی (`./`) استفاده می‌کنند، روی GitHub Pages در یک زیرمسیر (مثل `/repo-name/`) هم بدون تغییر کار می‌کند.

## فرمول محاسبه
```
قیمت پایه = قیمت هر گرم × وزن
اجرت      = قیمت پایه × (درصد اجرت / ۱۰۰)
سود       = (قیمت پایه + اجرت) × (درصد سود / ۱۰۰)
مالیات    = (اجرت + سود) × (درصد مالیات / ۱۰۰)
جمع کل    = قیمت پایه + اجرت + سود + مالیات
```
