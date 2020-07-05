```
kops create ig morenodes --name sprx.k8s.local
```
Use this command to create a new instance group seperately for the cache and then edit the instance group to add number of instances and type of instance


```
kubectl create secret generic regcred \
    --from-file=.dockerconfigjson=<path/to/.docker/config.json> \
    --type=kubernetes.io/dockerconfigjson
```
Use this command to create a secret for private registry
