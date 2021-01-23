docker build -t luissricardo/multi-client:latest -t luissricardo/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t luissricardo/multi-server:latest -t luissricardo/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t luissricardo/multi-worker:latest -t luissricardo/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push luissricardo/multi-client:latest
docker push luissricardo/multi-server:latest
docker push luissricardo/multi-worker:latest

docker push luissricardo/multi-client:$SHA
docker push luissricardo/multi-server:$SHA
docker push luissricardo/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/client-deployment client=luissricardo/multi-client:$SHA
kubectl set image deployments/server-deployment server=luissricardo/multi-server:$SHA
kubectl set image deployments/worker-deployment worker=luissricardo/multi-worker:$SHA
