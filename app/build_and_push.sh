read -p "Did you uncomment the icons for prod in utils/Icons/icons.js?" proceed
if [ "$proceed" == "yes" ];
then
  cp config.prod.json config.json
  docker build -t gcr.io/seismic-trail-221522/scaffold/app -f Dockerfile.prod .
  docker push gcr.io/seismic-trail-221522/scaffold/app
else
  echo exiting
fi
