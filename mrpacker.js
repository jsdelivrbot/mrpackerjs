function mrpacker_getDecoder() {
  var d = {};
  d.decode = decode;

  const float64Array = new Float64Array(1);
  const uintF64 = new Uint8Array(float64Array.buffer);
  

  function decode(arr) {
    d.arr = arr;
    d.off = 0;
    return dec();
    
  }
  function dec() {
    if ( (d.arr[d.off] & 0xE0) == 0xC0 ) {  // tiny int
      ret = d.arr[d.off] & 0x1F;
      d.off += 1;
      return ret;
    }
    if ( d.arr[d.off] == 0x66 ) { 
      d.off += 1;
      var len = (d.arr[d.off++] << 24) | (d.arr[d.off++] << 16) | (d.arr[d.off++] << 8) | d.arr[d.off++];
      //var view = new DataView(d.arr.buffer, d.off, 4);
      //d.off += 4;
      //var len = view.getInt32();
      var ret = arrToString(len);
      return ret;
    }
    if ( (d.arr[d.off] & 0xE0) == 0x80 ) {  // String
      var len = d.arr[d.off] & 0x1F;
      d.off += 1;
      var ret = arrToString( len );
      return ret;
    }
    if ( d.arr[d.off] == 0x60 ) { d.off +=1; return null; }
    if ( d.arr[d.off] == 0x61 ) { d.off +=1; return true; }
    if ( d.arr[d.off] == 0x62 ) { d.off +=1; return false; }
    if ( d.arr[d.off] == 0x63 ) { 
      d.off += 1;
      uintF64.set( d.arr.slice(d.off,d.off+8) );
      d.off += 8;
      return float64Array[0];
    }
    if ( d.arr[d.off] == 0x64 ) { 
      d.off += 1;
      var ret = (d.arr[d.off++] << 24) | (d.arr[d.off++] << 16) | (d.arr[d.off++] << 8) | d.arr[d.off++];
      d.off += 4;
      // TODO Use int 64? 
      //var view = new DataView(d.arr.buffer, d.off, 4);
      //d.off += 8;
      //return view.getInt32();
      //var ret = new Int64BE(d.arr.slice(d.off,d.off+8) );
      return ret;
    }
    if ( d.arr[d.off] == 0x65 ) { 
      d.off += 1;
      var ret = (d.arr[d.off++] << 24) | (d.arr[d.off++] << 16) | (d.arr[d.off++] << 8) | d.arr[d.off++];
      //var view = new DataView(d.arr.buffer, d.off, 4);
      //d.off += 8;
      //return view.getUint32();
      //var ret = new Uint64BE(d.arr.slice(d.off,d.off+8) );
      return ret;
    }
    if ( d.arr[d.off] == 0x67 ) { 
      d.off += 1;
      return (d.arr[d.off++] << 24) | (d.arr[d.off++] << 16) | (d.arr[d.off++] << 8) | d.arr[d.off++];
      //var view = new DataView(d.arr.buffer, d.off, 4);
      //d.off += 4;
      //return view.getInt32();
    }
    if ( d.arr[d.off] == 0x68 ) { 
      d.off += 1;
      return (d.arr[d.off++] << 24) | (d.arr[d.off++] << 16) | (d.arr[d.off++] << 8) | d.arr[d.off++];
      //var view = new DataView(d.arr.buffer, d.off, 4);
      //d.off += 4;
      //return view.getUint32();
    }
    if ( d.arr[d.off] == 0x69 ) { 
      d.off += 1;
      var len = (d.arr[d.off++] << 24) | (d.arr[d.off++] << 16) | (d.arr[d.off++] << 8) | d.arr[d.off++];
      var ret = new Array(len);
      for (var i = 0; i < len; i++) {
        ret[i] = dec();
      }
      return ret;
    }
    if ( d.arr[d.off] == 0x6A ) { 
      d.off += 1;
      var len = (d.arr[d.off++] << 24) | (d.arr[d.off++] << 16) | (d.arr[d.off++] << 8) | d.arr[d.off++];
      var ret = {};
      for (var i = 0; i < len; i++) {
        ret[dec()] = dec();
      }
      return ret;
    }
    if ( (d.arr[d.off] & 0xE0) == 0x40 ) {  // List
      var len = d.arr[d.off] & 0x1F;
      d.off += 1;
      var ret = new Array(len);
      for (var i = 0; i < len; i++) {
        ret[i] = dec();
      }
      return ret;
    }
    if ( (d.arr[d.off] & 0xE0) == 0x20 ) {  // Dict
      var len = d.arr[d.off] & 0x1F;
      d.off += 1;
      var ret = {};
      for (var i = 0; i < len; i++) {
        ret[dec()] = dec();
      }
      return ret;
    }
  }
  function arrToString(len) {
    var string = '';
    var chr = 0;
    var end = d.off + len;
    while (d.off < end) {
      chr = d.arr[d.off++];
      if (chr < 128) {
        string += String.fromCharCode(chr);
        continue;
      }
  
      if ((chr & 0xE0) === 0xC0) {
        // 2 bytes
        chr = (chr & 0x1F) << 6 |
              (d.arr[d.off++] & 0x3F);
  
      } else if ((chr & 0xF0) === 0xE0) {
        // 3 bytes
        chr = (chr & 0x0F)             << 12 |
              (d.arr[d.off++] & 0x3F) << 6  |
              (d.arr[d.off++] & 0x3F);
  
      } else if ((chr & 0xF8) === 0xF0) {
        // 4 bytes
        chr = (chr & 0x07)             << 18 |
              (d.arr[d.off++] & 0x3F) << 12 |
              (d.arr[d.off++] & 0x3F) << 6  |
              (d.arr[d.off++] & 0x3F);
      }
  
      if (chr >= 0x010000) {
        // A surrogate pair
        chr -= 0x010000;
  
        string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
      } else {
        string += String.fromCharCode(chr);
      }
    }
  
    return string;
  }
  function arrToStr(len) {
    var charFromCodePt = String.fromCodePoint || String.fromCharCode;
    var ret = [];
    var codePt, byte1;
    for (var i = d.off; i < d.off+len;) {
      byte1 = d.arr[i++];

      if (byte1 <= 0x7F) {
        codePt = byte1;
      } else if (byte1 <= 0xDF) {
        codePt = ((byte1 & 0x1F) << 6) | (d.arr[i++] & 0x3F);
      } else if (byte1 <= 0xEF) {
        codePt = ((byte1 & 0x0F) << 12) | ((d.arr[i++] & 0x3F) << 6) | (d.arr[i++] & 0x3F);
      } else if (String.fromCodePoint) {
        codePt = ((byte1 & 0x07) << 18) | ((d.arr[i++] & 0x3F) << 12) | ((d.arr[i++] & 0x3F) << 6) | (d.arr[i++] & 0x3F);
      } else {
        codePt = 63;    // Cannot convert four byte code points, so use "?" instead
        i += 3;
      }

      ret.push( charFromCodePt(codePt) );
    }

    return ret.join('');
  }

  return d;
}

function mrpacker_getEncoder() {

  var e = {};
  e.encode = encode;
  e.enc = enc;
  e.off = 0;
  e.arr =  new Uint8Array(2048);

  const float64Array = new Float64Array(1);
  const uInt8Float64Array = new Uint8Array(float64Array.buffer);

  funcs = {
    "function":  nul,
    "undefined": nul,
    "boolean":   bool,
    "number":    number,
    "object":    object,
    "string":    string,
  };

  function encode( o ) {
    e.off = 0;
    enc(o);
    return e.arr.slice(0,e.off);
  }  
  function enc(o) {
    funcs[typeof o](o);
  }

  function nul( o ) {
    e.arr[e.off++] = 0x60
  }

  function bool( o ) {
    e.arr[e.off++] = o ? 0x61 : 0x62;
  }

  function number( o ) {
    var i = o | 0;
    if (i !== o) { // Float
      e.arr[e.off++] = 0x63;
      float64Array[0] = o;
      e.arr[e.off++] = uInt8Float64Array[0];
      e.arr[e.off++] = uInt8Float64Array[1];
      e.arr[e.off++] = uInt8Float64Array[2];
      e.arr[e.off++] = uInt8Float64Array[3];
      e.arr[e.off++] = uInt8Float64Array[4];
      e.arr[e.off++] = uInt8Float64Array[5];
      e.arr[e.off++] = uInt8Float64Array[6];
      e.arr[e.off++] = uInt8Float64Array[7];
    } else if ( i >=0 && i < 32 ) {
      e.arr[e.off++] = 0xC0 | i;
    } else {
      if ( i < 0 ) e.arr[e.off++] = 0x67;
      else         e.arr[e.off++] = 0x68;
      e.arr[e.off+3] = i;
      i = i >>> 8;
      e.arr[e.off+2] = i;
      i = i >>> 8;
      e.arr[e.off+1] = i;
      i = i >>> 8;
      e.arr[e.off] = i;
      e.off += 4;
    }
  }

  function strToArr(str ) {
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
      if (charcode < 0x80) e.arr[e.off++] = charcode;
      else if (charcode < 0x800) {
        e.arr[e.off++] = 0xc0 | (charcode >> 6);
        e.arr[e.off++] = 0x80 | (charcode & 0x3f);
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
        e.arr[e.off++] = 0xe0 | (charcode >> 12);
        e.arr[e.off++] = 0x80 | ((charcode>>6) & 0x3f);
        e.arr[e.off++] = 0x80 | (charcode & 0x3f);
      }
      else {
        i++;
        charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                  | (str.charCodeAt(i) & 0x3ff))
        e.arr[e.off++] = 0xf0 | (charcode >>18);
        e.arr[e.off++] = 0x80 | ((charcode>>12) & 0x3f);
        e.arr[e.off++] = 0x80 | ((charcode>>6) & 0x3f);
        e.arr[e.off++] = 0x80 | (charcode & 0x3f);
      }
    }
  }
  function string( o ) {
    var l = o.length;
    if ( l < 32 ) {
      e.arr[e.off++] = 0x80 | l;
      strToArr(o);
    } else {
      e.arr[e.off++] = 0x66;
      var i = l;
      e.arr[e.off+3] = i;
      i = i >>> 8;
      e.arr[e.off+2] = i;
      i = i >>> 8;
      e.arr[e.off+1] = i;
      i = i >>> 8;
      e.arr[e.off] = i;
      e.off += 4;
      strToArr(o);
    }
  }

  function object( o ) {
    if ( o === null ) { nul(o); return; }
    if ( Array.isArray(o) ) { array(o); return; }
    map(o);
  }

  function array( o ) {
    var l = o.length;
    if ( l < 32 ) {
      e.arr[e.off++] = 0x40 | l;
    } else {
      e.arr[e.off++] = 0x6A;
      var i = l;
      e.arr[e.off+3] = i;
      i = i >>> 8;
      e.arr[e.off+2] = i;
      i = i >>> 8;
      e.arr[e.off+1] = i;
      i = i >>> 8;
      e.arr[e.off] = i;
      e.off += 4;
    }
    for (var i = 0; i < l; i++) {
      e.enc(o[i]);
    }      
  }

  function map( o ) {
    var keys = Object.keys(o);
    var l = keys.length;

    if ( l < 32 ) {
      e.arr[e.off++] = 0x20 | l;
    } else {
      e.arr[e.off++] = 0x69;
      var i = l;
      e.arr[e.off+3] = i;
      i = i >>> 8;
      e.arr[e.off+2] = i;
      i = i >>> 8;
      e.arr[e.off+1] = i;
      i = i >>> 8;
      e.arr[e.off] = i;
      e.off += 4;
    }
    keys.forEach(function(key) {
      e.enc(key);
      e.enc(o[key]);
    });
  }  
     
    //"function": nil,
    //"number": number,
    //"object": (useraw ? object_raw : object),
    //"string": _string(useraw ? raw_head_size : str_head_size),
    //"symbol": nil,
    //"undefined": nil
  //};

  return e;
}
