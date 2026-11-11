NESTNEEV BLOG ON WORDPRESS (nestneev.com/blog)
==============================================

Goal: the blog lives on WordPress (Hostinger) but still appears at
nestneev.com/blog, so the client can publish daily and do SEO with
Yoast / Rank Math, with no developer needed. The rest of the website stays as is.

Files here
- nestneev-blog-export.xml : the 6 existing blog posts + cover images, same URLs (slugs)

STEP A - Install WordPress in a "blog" folder (client, Hostinger hPanel)
1. hPanel -> Websites -> Add website (or the domain already purchased) -> WordPress.
2. When it asks for the install location / directory, type:   blog
   (so WordPress lives at  YOUR-HOSTINGER-DOMAIN/blog ). Finish the install.
3. Send the developer: the Hostinger domain (example: https://yourname.hostingersite.com)

STEP B - Developer switches the forwarding on (developer only)
Set BLOG_ORIGIN in wrangler.toml to that domain and push. Then nestneev.com/blog
is served from WordPress. (Until then the old static blog keeps working.)

STEP C - Point WordPress at nestneev.com/blog (client, after Step B)
WordPress admin -> Settings -> General:
   WordPress Address (URL):  https://nestneev.com/blog
   Site Address (URL):       https://nestneev.com/blog
Save. (Log in again at https://nestneev.com/blog/wp-admin)
IMPORTANT: do this ONLY after Step B, or the admin will lock.

STEP D - Settings (client)
- Settings -> Permalinks -> choose "Post name" -> Save  (keeps old URLs the same)
- Plugins -> Add New -> install "Yoast SEO" (or "Rank Math")
- Tools -> Import -> WordPress -> install importer -> upload nestneev-blog-export.xml
  -> tick "Download and import file attachments" -> Submit

STEP E - Finish (developer)
Tell the developer when done; they update the sitemap/robots and test the forms and tracking.
