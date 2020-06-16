number=$1
for num in $(seq 0 $number);
do
cat dat.txt | kubectl exec -i cache-$num -- redis-cli --pipe
done
