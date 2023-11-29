#!/usr/bin/perl

my $basedir;
BEGIN {
	$basedir = $0;
	$basedir =~ s/[^\/]*$//g;
	if(!$basedir){ $basedir = "./"; }
	$lib = $basedir."";
}
use Data::Dumper;
use utf8;
binmode STDOUT, 'utf8';
binmode STDERR, 'utf8';


$file = $ARGV[0]||$basedir."../../geography-bits-osm/good.tsv";
$chunksize = $ARGV[1]||10000;



# Open the index of areas
open(FILE,$file);
@lines = <FILE>;
close(FILE);

%lookup;

for($l = 1; $l < @lines; $l++){
	$line = $lines[$l];

	# Remove newlines
	$line =~ s/[\n\r]//g;

	# If we have a line, split it by a tab character
	if($line =~ /^([^\t]+)\t(.*$)/){
		$name = $1;
		$rest = $2;

		# Take a copy of the name and replace commas and "&" with a pipe
		$tname = lc($name);
		$tname =~ s/(City of )([^\s]+)/$1$2, $2/;
		$tname =~ s/(\, | \& )/\|/g;
		$tname =~ s/\s{2,}/ /g;
		$tname =~ s/\t/ /g;

		# Split to find the name fragments
		@names = split(/\|/,$tname);

#		print "$name\t\t$rest\tFRAG=$tname\n";

		for($n = 0; $n < @names; $n++){
			if($names[$n]){
				push(@fulllist,{'frag'=>$names[$n],'name'=>$name,'rest'=>join("\t",$rest)});
			}
		}
	}
}

@fulllist = sort{$a->{'frag'} cmp $b->{'frag'}}(@fulllist);

print "Sorted.\n";
$txt = "";
$prev = "";
$s = 0;
$e = 0;
$meta = "";

for($i = 0; $i < @fulllist; $i++){
	$s = length($txt);
	$txt .= "$fulllist[$i]->{'name'}\t$fulllist[$i]->{'rest'}\n";
	$s2 = length($txt);
	print "$fulllist[$i]->{'name'} = $s\n";
	if(!$prev){ $prev = $fulllist[$i]->{'frag'}; }
	if($s > $e+$chunksize && $fulllist[$i]->{'frag'} ne $prev){
		$meta .= "$prev\t$fulllist[$i]->{'frag'}\t$e\t".($s2-1)."\n";
		$e = $s;
		$prev = $fulllist[$i]->{'frag'};
	}
}

open(FILE,">",$basedir."osm_full.tsv");
print FILE $txt;
close(FILE);

open(FILE,">",$basedir."osm_meta.tsv");
print FILE $meta;
close(FILE);
