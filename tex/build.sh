#docker-compose run texlive -synctex=1 -interaction=nonstopmode -lualatex -f -shell-escape test.tex
docker-compose run texlive -synctex=1 -lualatex -f -shell-escape test.tex
