# How to update stock and colors

Everything is in one file: **`products.txt`**. Every product page on the website reads it.

## Mark something in or out of stock

1. On GitHub, open **`products.txt`** and click the **pencil icon** (Edit) at the top right.
2. Find the product's line and change `yes` to `no` (out of stock), or `no` to `yes` (back in stock).
3. Click **Commit changes…** and then **Commit changes** again.
4. The website updates in 1–2 minutes. Out-of-stock items stay on the site with an **Out of stock** label.

Examples:

```
R57       | no                      <- vinyl color R57 is out of stock
T307      | yes | no  | yes         <- T307 countertop in stock, 36" island out, 52" island in
```

For cabinets, add the cabinet code on its own line under `[cabinets out of stock]`. Delete the line when it's back.

## Remove a color

Delete its whole line in `products.txt` and commit. Color counts on the site ("17 colors" and so on) update by themselves.

## Add a new color

1. **Upload the photos first.** Open the folder named in that section of `products.txt` (for example `images/Flooring/web/`), click **Add file → Upload files**, drag the photos in, and commit.
   - Name the photos exactly as the section explains. For vinyl and laminate that's 3 photos: `CODE.jpg`, `CODE-1.jpg` and `CODE-2.jpg` (for example `R60.jpg`, `R60-1.jpg`, `R60-2.jpg`).
   - Use `.jpg` files around 1,000–1,600 pixels wide. Huge phone photos make the site slow.
2. **Add a line to `products.txt`.** Copy an existing line in the same section, change the code, and put it where you want it to appear (the line order is the order on the site).
3. Commit. The new color appears in 1–2 minutes.

## Tips

- Lines starting with `#` are notes. The website ignores them.
- The spaces that line things up don't matter. Only the `|` between columns does.
- Codes can't contain spaces.
- If you make a mistake, open the file's **History** on GitHub to see or restore an earlier version.
- To try a change without customers seeing it, make it on the test site first (`royal-site-staging`).
