#!/usr/bin/perl

my $basedir;
BEGIN {
	$basedir = $0;
	$basedir =~ s/[^\/]*$//g;
	if(!$basedir){ $basedir = "./"; }
	$lib = $basedir."";
}
use utf8;
use Data::Dumper;
binmode STDOUT, 'utf8';
binmode STDERR, 'utf8';

$datadir = $ARGV[0]||$basedir."../../geography-bits/data/";
$chunksize = $ARGV[1]||10000;
@codes = split(";",$ARGV[2]||"LAD23CD;PCON17CD;WD21CD");


if(!-d $datadir){
	print "Unfortunately, \"$datadir\" is not a directory.\n";
	exit;
}



foreach $code (@codes){
	if(!-d $datadir.$code){
		print "Unfortunately, \"$datadir$code\" is not a directory.\n";
	}else{
		$dir = $datadir.$code."/";
		opendir($dh,$dir);
		while( ($filename = readdir($dh))){
			if($filename =~ /(.*)\.geojsonl/){
				$id = $1;
				$name = $code;
				$name =~ s/CD$/NM/g;
				open(FILE,$dir."/".$filename);
				@lines = <FILE>;
				close(FILE);
				if($lines[0] =~ /\"$id\"/ && $lines[0] =~ /\"$name\": ?\"(.*?)\"(\, ?\"| \}|\})/){
					push(@rows,"$code/$id\t$1");
				}else{
					print "Bad file $dir/$filename\n";
					print substr($lines[0],0,100);
				}
			}
		}
		closedir($dh);
	}
}

%lookup;

foreach $line (@rows){

	# Remove newlines
	$line =~ s/[\n\r]//g;

	# If we have a line, split it by a tab character
	if($line){
		($code,$name) = split(/\t/,$line);

		# Take a copy of the name and replace commas and "&" with a pipe
		$tname = lc($name);
		$tname =~ s/(City of )([^\s]+)/$1$2, $2/;
		$tname =~ s/(\, | \& )/\|/g;
		$tname =~ s/\s{2,}/ /g;
		$tname =~ s/\t/ /g;

		# Split to find the name fragments
		@names = split(/\|/,$tname);

		for($n = 0; $n < @names; $n++){
			if($names[$n]){
				push(@fulllist,{'frag'=>$names[$n],'name'=>$name,'code'=>$code});
			}
		}
	}
}

@fulllist = sort{$a->{'frag'} cmp $b->{'frag'}}(@fulllist);

$txt = "";
$prev = "";
$s = 0;
$e = 0;
$meta = "";


for($i = 0; $i < @fulllist; $i++){
	$s = length($txt);
	$txt .= "$fulllist[$i]->{'name'}\t$fulllist[$i]->{'code'}\n";
	$s2 = length($txt);
	print "$fulllist[$i]->{'name'} = $s\n";
	if(!$prev){ $prev = $fulllist[$i]->{'frag'}; }
	if($s > $e+$chunksize && $fulllist[$i]->{'frag'} ne $prev){
		$meta .= "$prev\t$fulllist[$i]->{'frag'}\t$e\t".($s2-1)."\n";
		$e = $s;
		$prev = $fulllist[$i]->{'frag'};
	}
}

open(FILE,">",$basedir."bits_full.tsv");
print FILE $txt;
close(FILE);

open(FILE,">",$basedir."bits_meta.tsv");
print FILE $meta;
close(FILE);
