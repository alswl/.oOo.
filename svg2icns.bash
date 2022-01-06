#! /bin/bash
###
### svg2icns.bash
###   Create ICNS file from SVG
###
### See also:
###   <https://stackoverflow.com/questions/12306223/how-to-manually-create-icns-files-using-iconutil#39678276>
###   <https://developer.apple.com/library/content/documentation/GraphicsAnimation/Conceptual/HighResolutionOSX/Optimizing/Optimizing.html>
###


script="$(basename $0 .bash)"

: ${MAGICK_HOME?Requires ImageMagick to be installed}
CONVERT_BIN="${MAGICK_HOME}/bin/convert"

## Usage function
usage() {
    cat <<END_USAGE >&2
Usage: ${script} <svgfilename> [<icnsfilename>]
  svgfilename:  input file in SVG format
  icnsfilename: output file in ICNS format (optional)

END_USAGE
}
 
## Call usage() function if args not supplied
argc="$#"
if [[ "$argc" -lt 1 ]] || [[ "$argc" -gt 2 ]];
then
    usage
    exit 1
fi

## Verify first positional argument
svgfilename="$1"
if [ ! -f "${svgfilename}" ];
then
    usage
    echo "${script}: no such file: ${svgfilename}" >&2
    exit 1
else
    ## Verify scalable vector graphics file
    $(file "${svgfilename}" | cut -d':' -f2- | grep -qs 'SVG')
    if [ "$?" -ne 0 ];
    then
        usage
        echo "${script}: SVG file required: ${svgfilename}" >&2
        exit 1
    fi
fi

## Verify second positional argument if given
if [ "$argc" -eq 2 ];
then
    icnsfilename="$2"
    if [ -n "${icnsfilename}" ];
    then
        ## Ensure file extension
        ext=${icnsfilename##*.}
        if [ "$ext" != "icns" ];
        then
            icnsfilename="${icnsfilename}.icns"
        fi
    else
        ## Given empty string as second arg
        icnsfilename="${svgfilename%.*}.icns"
    fi
else
    ## No second arg
    icnsfilename="${svgfilename%.*}.icns"
fi

## Create iconset directory if necessary
iconsetdirname="${icnsfilename%.*}.iconset"
mkdir -p "${iconsetdirname}"

##+---------------------+--------------------+--------------+
##|      filename       | resolution, pixels | density, PPI |
##+---------------------+--------------------+--------------+
##| icon_16x16.png      | 16x16              |           72 |
##| icon_16x16@2x.png   | 32x32              |          144 |
##| icon_32x32.png      | 32x32              |           72 |
##| icon_32x32@2x.png   | 64x64              |          144 |
##| icon_128x128.png    | 128x128            |           72 |
##| icon_128x128@2x.png | 256x256            |          144 |
##| icon_256x256.png    | 256x256            |           72 |
##| icon_256x256@2x.png | 512x512            |          144 |
##| icon_512x512.png    | 512x512            |           72 |
##| icon_512x512@2x.png | 1024x1024          |          144 |
##+---------------------+--------------------+--------------+

## Create PNG files as described in table
sizes=( 16 32 128 256 512 )
densities=( 72 144 )

for size in "${sizes[@]}"
do
    dimen="${size}x${size}"
    for density in "${densities[@]}"
    do
        if [ "${density}" == "72" ];
        then
            ## std
            resolution="${dimen}"
            scale=""
        else
            ## hires
            resolution="$(( $size * 2 ))x$(( $size * 2 ))"
            scale="@2x"
        fi
        pngfilename="${iconsetdirname}/icon_${dimen}${scale}.png"
        #echo \
        ${CONVERT_BIN} \
           -background "none" \
           -density "${density}" \
           -resize "${resolution}!" \
           -units "PixelsPerInch" \
           "${svgfilename}" \
           "${pngfilename}"
        if [ "$?" -ne 0 ];
        then
            echo "${script}: error creating icon file: ${pngfilename}" >&2
            exit 1
        fi
    done
done

## Convert iconset to ICNS file
iconutil --convert icns "${iconsetdirname}"
if [ "$?" -ne 0 ];
then
    echo "${script}: error converting iconset to ICNS: ${iconsetdirname}" >&2
    exit 1
else
    rm -rf "${iconsetdirname}"
fi

exit 0
