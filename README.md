# Cartoon CLI

CLI for watching and browsing Cartoons

# Downlaod

```
npm i cartoon-cli -g
```

# Usage

Cannot run with more than one cli at once.

## Set Settings

#### Download

```
 # downloads episode mp4
cartoon --download or --d

 # saves episode info in json file
cartoon --no-download or --no-d

```

#### File Directory

# Changes default path

```
cartoon --path=D:/Desktop/Cartoons
```

# One-time change

```
cartoon --specify=C:/Documents/Cartoons/ben_10
```

## or specify after:

```
cartoon samurai jack --specify

```

### output

```
--specify needs a value (ex. D:/desktop/cartoons) : C:/Documents/Cartoons/ben_10
```

# Example

```
cartoon samurai jack

Getting Results...

[0]--Samurai Jack Season 1
[1]--Samurai Jack Season 2
[2]--Samurai Jack Season 3
[3]--Samurai Jack Season 4
[4]--Samurai Jack Season 5

Choose Index : 3

Starting To Fetch Every Episode...

```
