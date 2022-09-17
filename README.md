# Canada Chinese Microsoft Tech Club
加国华人微软技术俱乐部

How to add a pretty log for git command line:
Add these to your git config by
git config --global -e
[alias]
l = log --pretty=format:"%C(yellow)%h\\ %ad%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --graph --all --decorate --date=short

Author: Guan Yu, Zhang San


Update date: 2022-09-16
