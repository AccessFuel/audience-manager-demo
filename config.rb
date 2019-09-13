require 'compass/import-once/activate'
# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "dist/css"
sass_dir = "dist/sass"
images_dir = "dist/af_img"
javascripts_dir = "dist/js"

# You can select your preferred output style here (can be overridden via the command line):
output_style = (environment == :production) ? :compressed : :expanded

# Config doesn't work with Compas 1.0 use the follow ing shortcut:
output_style = :expanded


# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass scss scss && rm -rf sass && mv scss sass
