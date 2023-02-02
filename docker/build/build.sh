#!/bin/bash

# --- This file must be run from the /build folder --- #

action=$1; shift
services=($@)

all=("auth")

echo ""

if [ "$action" == "build" ];
then
  if (( ${#services[@]} == 0 ))
  then
    services=${all[@]}
  fi
  for service in ${services[@]}
    do
      if ! [[ -f ./$service.Dockerfile ]]
      then
        echo -e "Error! $service.Dockerfile does not exist"
        exit 1
      fi
    done
fi

case ${action} in
  build)
    pushd ../../
    echo "Building services..."
    for service in ${services[@]}
      do
        echo "Building image for $service"
        docker build -t jauth-$service -f ./docker/build/$service.Dockerfile .
      done
    popd
  ;;
#   run)
#     echo "Running Docker Compose..."
#     if (( ${#services[@]} == 0 ))
#     then
#       docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
#     else
#       docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d ${services[@]}
#     fi
#   ;;
#   run:prod)
#     echo "Running Docker Compose..."
#         if (( ${#services[@]} == 0 ))
#         then
#           docker compose up -d
#         else
#           docker compose up -d ${services[@]}
#         fi
#   ;;
  --help)
    echo " ./build.sh build ...args  - build docker images"
    # echo " ./build-tools.sh run            - deploy images with docker compose"
    echo ""
    echo " ...args must correspond to 'arg.Dockerfile' in /build and 'image: jauth-[arg]' in '../docker-compose.yml'"
    exit 1
  ;;
  *)
    echo -e " Invalid command"
    echo " See './build.sh --help'"
    exit 1
esac