curl -Lo kops https://github.com/kubernetes/kops/releases/download/$(curl -s https://api.github.com/repos/kubernetes/kops/releases/latest | grep tag_name | cut -d '"' -f 4)/kops-linux-amd64
chmod +x ./kops
sudo mv ./kops /usr/local/bin/
curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.17.0/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
aws s3api create-bucket --bucket sprx-kops-state --region us-east-1
export KOPS_STATE_STORE=s3://sprx-kops-state
ssh-keygen
kops create cluster --name sprx.k8s.local --zones ap-south-1b --master-size t3.medium --node-size t3.medium --kubernetes-version 1.17.6
kops create secret sshpublickey admin -i ~/.ssh/id_rsa.pub  --name sprx.k8s.local --state s3://sprx-kops-state
kops update cluster --name sprx.k8s.local --yes
