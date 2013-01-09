//<script>;
/*
 * ===============================================================================
 *
 * 	Copyright 2011 @ Piotr (Peter) Fronc
 *
 *     This file is part of BNCConnector project.
 *
 *     BNCConnector is free software: you can redistribute it and/or modify
 *     it under the terms of the Lesser GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     BNCConnector is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     Lesser GNU General Public License for more details.
 *
 *     You should have received a copy of the Lesser GNU General Public License.
 *     If not, see <http://www.gnu.org/licenses/>.
 *
 * ===============================================================================
 */
(function(){
	window.BNC_CONNECTOR_LICENCE="Copyright 2011 @ Piotr (Peter) Fronc, Please check LGPL license details at http://theprivateland.com/bncconnector/licence.htm. Wherever you use this software this line of code must stay in with this code.";
    /*
 * ===============================================================================
 *
 * 	Copyright 2011 @ Piotr (Peter) Fronc (theprivateland.com)
 *
 *     This file is part of BNCConnector project.
 *
 *     BNCConnector is free software: you can redistribute it and/or modify
 *     it under the terms of the Lesser GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     BNCConnector is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     Lesser GNU General Public License for more details.
 *
 *     You should have received a copy of the Lesser GNU General Public License.
 *     If not, see <http://www.gnu.org/licenses/>.
 *
 * ===============================================================================
 */
var IS_IE = false;
if(navigator.appName=="Microsoft Internet Explorer"){
	IS_IE=true;
}
/*
if(IS_IE) {
	Array.prototype.push = function(o){
		return this[this.length] = o;
	}
}*/
    
var OPERA = false;
if(navigator.userAgent.toLowerCase().lastIndexOf("opera")!=-1){
    OPERA = true;
}
if (!window.console){
	window.console ={};
	console.log = function(){};
}
/**
 * Used to encode data for cookie (encodeURIComponent), override for preffered one if such a need. Default should be best choice.
 */
var prepareData =  function(o){
	return encodeURIComponent(o)
};
/**
 * Used to decode data for cookie (decodeURIComponent), override for preffered one if such a need. Default should be best choice.
 */
var unprepareData = function(o){
	return decodeURIComponent(o)
};
var cnt =0;
var tmp = '; expires='+new Date( new Date().getTime()+86400000*1000 ).toGMTString();
var TODAY_EXPIRY = function(){
	//return tmp;
	return ";";// '; expires='+new Date( new Date().getTime()+1000 ).toGMTString();
};
/**
 *	Packet name in use by cookie.
 */
var PACKET = "TCP";
var EMPTY_STRING = "";
var MULTICAST_PACKET = "MCP";
/**
 * Fake logger
 */
function log(string,level){
	if(window.console){
        console.log(string,level);
    }
}
/**
 * Used to read string attached by name, you may override this method to enforce connector to use different packet holder (cookie now).
 */
function getCookie(name){
	var c = document.cookie;
	var start = c.indexOf(name + "=");
	if (start!=-1){
		start+=name.length+1;
		var end = c.indexOf(";",start);
		if (end==-1)
			end=c.length;
		return unprepareData( c.substring(start,end) );
	}else{
		return '';
	}
}
/**
 * Used to read string attached by name, you may override this method to enforce connector to use different packet holder (cookie now).
 * If you wish to use other extensions for single sharing data (like flash plugins or java applets), override this method and all transfers will be redirected to your choice.
 * When you override setCookie remember to override getCookie method.
 */
function setCookie(name,value){
	document.cookie=name+ "=" +prepareData(value);
}

var _token = 0;
function setPacket(value){
	_token = new Date().valueOf();
	setCookie(PACKET,_token+value);
    
}

var RECEIVER=0, BUSY = 1, RECEIVED = 2, DONE = 3, SENDER = 4, DATA = 5, LED = 6;

window.getPacket = function (){
	var set = getCookie(PACKET);
	var ret = [];

	ret[RECEIVER] = set.substring(13,RECEIVER_OFFSET);
	ret[BUSY] = set.charAt(RECEIVER_OFFSET)*1;
	ret[RECEIVED] = set.charAt(REC_OFFSET)*1;
	ret[DONE] = set.charAt(DONE_OFFSET)*1;
	ret[SENDER] = set.substring(SENDER_OFFSET,SENDER_IP_LIMIT_OFFSET);
	ret[DATA] = set.substring(DATA_OFFSET,set.length);
	ret[LED] = set.substring(0,13)*1;
//	if(ret[0]&&ret[0]!="00"){
//        console.log(ret);
//    }
    return ret;
}
/**
 * response atime when in transmiting mode.
 */
var TRANSMIT_DTIME = 0;
/**
 * Interrupt allowance time (for letting other peers proceed)
 */
var MAX_WAIT    = 5;
/**
 * Single packet deadlock allowance.
 */
var PACKET_TIMEOUT = IS_IE ? 100 : 55;
/**
 * PACKET maximum size for cookie - remember that common value for all browsers should not be bigger than:
 * 4096 - 4 - 11 - 3*128;.
 * Default value is 3000     +4+11, in most cases much smaller value should be enough, when you write applications using cookie as well REMEMBER
 * to adjust this property(!).
 */
var PACKET_SIZE = window.PACKET_SIZE || (2000 +4+11);
var RECEIVERS_LIMIT = window.RECEIVERS_LIMIT ||  128;
var IP_LIMIT = window.IP_LIMIT || 2;
var RECEIVER_OFFSET = IP_LIMIT +13;
var REC_OFFSET= RECEIVER_OFFSET +1;
var DONE_OFFSET = REC_OFFSET +1;
var SENDER_OFFSET = DONE_OFFSET +1;
var SENDER_IP_LIMIT_OFFSET = SENDER_OFFSET + IP_LIMIT;
var DATA_OFFSET = SENDER_IP_LIMIT_OFFSET;
var NULL_PACKET = '00000000000000000000';
var ERROR_PACKET = '##000##0000000000000';
var MULTICAST_LEN = RECEIVERS_LIMIT*(IP_LIMIT+1);

if(!getCookie(PACKET) || getCookie(PACKET)==null || getCookie(PACKET)==''){
	setPacket(NULL_PACKET);
}

var IP_MC_LEN = 3;
/**
 * Used to retrieve single monitor packet.
 * @return Array[stamp,state,Array[peer]]
 */
function getMulticastPacket(){

	var setof = getCookie(MULTICAST_PACKET);
	var set = setof.substring(13);
	var stamp = setof.substring(0,13);
	var ret = [];

	if(set !== null){
		var many = set.length/IP_MC_LEN;
		for(var i=0;i<many;i++){
			ret[i] = [
				set.substring(i*3,i*3 +2),
				set.charAt(i*3+2)
			];
		}
	}
	return [stamp,set,ret];
}
function setMulticastPacket(p,nodate){
	var date = new Date().valueOf();
	if(!nodate){
		date = getMulticastPacket()[0];
	}
	setCookie( MULTICAST_PACKET, date + p );
}
function isInMCPByName(packet,name){
	if( !packet || packet == ''){
		return true;
	}
	var len = packet[2].length;
	var there = false;
	var i=0;
	for(;i<len;i++){
		var ip = packet[2][i][0];
		if( ip == name ) {
			there = true;
			break;
		}
	}
	if(there){
		return true;
	}else{
		return false;
	}
}

var lastOnlinePeers = {};
/**
 * Amount of unresponsive times for peers monitored by bnc monitor.
 * When monitor detects no response from other peers it will collect that information and if
 * it happens more than ERROR_TIMEOUT_MONITOR_MAX_AMOUNT time will remove them from peers list.
 * [var ERROR_TIMEOUT_MONITOR_MAX_AMOUNT = window.ERROR_TIMEOUT_MONITOR_MAX_AMOUNT || 2;]
 */
var ERROR_TIMEOUT_MONITOR_MAX_AMOUNT = window.ERROR_TIMEOUT_MONITOR_MAX_AMOUNT || 2;
/**
 * IMPORTANT: when monitor used.
 * OVERALL delay allowed for monitor error detection against dead peers, in some cases
 * it may happen that browser will be killed and monitor will not be able to cleanup
 * peers state, in such case monitor will detect dead peers and remove them from list.
 * Opera browser does NOT support on unload events and this DELAY_ALLOWED will be set to much smaller value (100ms).
 * [var DELAY_ALLOWED = window.DELAY_ALLOWED || 800;]
 */
var DELAY_ALLOWED = window.DELAY_ALLOWED || 800;
if(OPERA || window.ONUNLOAD_NOT_SUPPORTED){
	//console.log("no support");
	ERROR_TIMEOUT_MONITOR_MAX_AMOUNT=1;
	DELAY_ALLOWED = 100;
}
function removeAllDeadMCP(packet,forcename){
	var ret = '';
	var len = packet[2].length;
	for(var i=0;i<len;i++){
		var peerIsUp = packet[2][i][1];
		var peerIP = packet[2][i][0];
		if( peerIsUp*1 !== 0 || peerIP == forcename){
			if(peerIP != forcename){
				lastOnlinePeers[peerIP] = [new Date().valueOf(),0];
				ret += peerIP + peerIsUp;
			}else{
				lastOnlinePeers[peerIP]=undefined;
			}
		}else if(!forcename){
			if(lastOnlinePeers[peerIP] !== undefined) {
				//console.log("ddd "+(new Date().valueOf() - lastOnlinePeers[peerIP][0]));
				if ( (lastOnlinePeers[peerIP][0] + DELAY_ALLOWED) < new Date().valueOf() ){
					// wasd registered and idle, removing
					//
					//alert("missing!"+((lastOnlinePeers[peerIP][0] + DELAY_ALLOWED) - new Date().valueOf()));
					//console.log("missing!"+((lastOnlinePeers[peerIP][0] + DELAY_ALLOWED) - new Date().valueOf()));
					if(lastOnlinePeers[peerIP][1] > ERROR_TIMEOUT_MONITOR_MAX_AMOUNT){
						lastOnlinePeers[peerIP]=undefined;
					}else if(ERROR_TIMEOUT_MONITOR_MAX_AMOUNT){
						lastOnlinePeers[peerIP] = [new Date().valueOf(),lastOnlinePeers[peerIP][1]+1];
						lastOnlinePeers[peerIP][1]++;//alert((lastOnlinePeers[peerIP][0] + DELAY_ALLOWED) - new Date().valueOf());
						ret += peerIP + peerIsUp;
					}
				}else{
					ret += peerIP + peerIsUp;
				}
			}else{
				//alert(peerIP+" now!"+(lastOnlinePeers[peerIP] ));
				if(lastOnlinePeers[peerIP] === undefined){
					lastOnlinePeers[peerIP]=[new Date().valueOf(),1];
				}
				ret += peerIP + peerIsUp;
			}
		}
	}
	setMulticastPacket(ret,true);
	return packet;
}

function setAllMCPByName(packet,num,array,val){
	var ret = '';
	var len = packet[2].length;
	for(var i=0;i<len;i++){
		packet[2][i][1] = num;
	}
	var arrayAt=0;
	if(array) {
		for(var j=arrayAt;j<array.length;j++){
			var was = false;
			len = packet[2].length;
			for(var i=0;i<len;i++){
				if(array[j]==packet[2][i][0]){
					packet[2][i][1]=val;
					arrayAt++;
					was=true;
					break;
				}
			}
			if(!was){
				packet[2].push([array[arrayAt]+'',1]);
				arrayAt++;
			}
		}
			
	}
	len = packet[2].length;
	for(var i=0;i<len;i++){
		ret += packet[2][i][0] + packet[2][i][1];
	}
	//console.log(ret);
	setMulticastPacket(ret);
	return ret;
}

function setMCPByName(packet,name,num){
	var ret = '';
	var len = packet[2].length;
	for(var i=0;i<len;i++){
		if( packet[2][i][0] == name ){
			packet[2][i][1] = num;
		}
		ret += packet[2][i][0] + packet[2][i][1];
	}
	setMulticastPacket(ret);
	return ret;
}

function setMCPInPacketByNameNoUpdate(packet,name,num){
	var len = packet[2].length;
	var exist = false;
	for(var i=0;i<len;i++){
		if( packet[2][i][0] == name ){
			packet[2][i][1] = num;
			exist =true;
		}
	}
	if(!exist){
		packet[2][packet[2].length]=[];
		packet[2][packet[2].length-1][0]=name;
		packet[2][packet[2].length-1][1]=num;
	}
	return packet;
}

function buildStringOfPacket(packet){
	var ret = '';
	var len = packet[2].length;
	for(var i=0;i<len;i++){
		ret += packet[2][i][0] + packet[2][i][1];
	}
	return ret;
}

    
//  Artificial timed part

var Link = function(o){
	this.obj = o;
};
Link.prototype.del = function(){
	if(this.prev){
		this.prev.next = this.next;
	}
	if(this.next){
		this.next.prev = this.prev;
	}
	delete this.obj;
	this.obj = undefined;
};

var LinkedList = function(){
	this.length = 0;
};
LinkedList.prototype.push = function(o){
	var p = new Link(o);
	if(this.last){
		this.last.next = p
		this.last.next.prev = this.last;
	}else{
		this.first = p;
	}
	this.last = p;
	this.length++;
};
LinkedList.prototype.rm = function(o){
	if( o === this.last){
		this.last = this.last.prev;
	}
	if( o === this.first){
		this.first = this.first.next;
	}
	o.del();
	this.length--;
	if(this.length == 0){
		this.last = this.first = undefined;
	}
};
/**
 * You can controll MAX_TIMEOUT_GRAN to specify how crouded timeouts can be.
 * Perfect is 1.
 */
window.MAX_TIMEOUT_GRAN = 1;
window.FORCE_NOT_USING_NORMAL_TIMEOUT = (true  && !IS_IE) ;
var exec_stack = new LinkedList();
var gestosc = MAX_TIMEOUT_GRAN;
// hack for HTML5 stupidity
var procLock = false;
var firstRun = true;
window.BNCReady = function(){};
var processtimes = function(){
	if(procLock){return;}
	procLock = true;
	var now = new Date().valueOf();
	var curLen = exec_stack.length;
	//console.log(exec_stack.length);
    if(firstRun){
        firstRun = false;
        try{
            window.BNCReady();
        }catch(ex){}
    }
	if(curLen >0){
		var el = exec_stack.first;
		var next;
		for(var i = 0;i<curLen;i++){
			next = el.next;
			if(el.obj[0] && el.obj[1]<now){
				try{
					el.obj[0]();
					exec_stack.rm(el)
				}catch(ex){}
			}
			el = next;
		}
	}
	procLock = false;
};
var _ = function(){
	for(var c=0;c<1000/gestosc;c++){
		setTimeout(processtimes,1000+gestosc*c);
	}
	setTimeout(_,1000);
}
if(FORCE_NOT_USING_NORMAL_TIMEOUT){
    // RUN !
    _();
}
function doTimeout(fun,dtime){
	if(FORCE_NOT_USING_NORMAL_TIMEOUT){
		return exec_stack.push([fun,(new Date().valueOf())+dtime]);
	}else{
        if(firstRun){
            firstRun = false;
            try{
                window.BNCReady();
            }catch(ex){}
        }
		return setTimeout(fun,dtime);
	}
}

	/*
 * ===============================================================================
 *
 * 	Copyright 2011 @ Piotr (Peter) Fronc (theprivateland.com)
 *
 *     This file is part of BNCConnector project.
 *
 *     BNCConnector is free software: you can redistribute it and/or modify
 *     it under the terms of the Lesser GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     BNCConnector is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     Lesser GNU General Public License for more details.
 *
 *     You should have received a copy of the Lesser GNU General Public License.
 *     If not, see <http://www.gnu.org/licenses/>.
 *
 * ===============================================================================
 */
/**
 * @class Static BNC Monitor instance, when called multiple will return reference to existing instance.
 * Usefull to check on existing peers in browser  when connector instance
 */

var BNCConnectorMonitor = function(){
	return BNCConnectorMonitor;
};

BNCConnectorMonitor.cleanDeadlocksOnly = false;

BNCConnectorMonitor.singleton = false;
var OPERA = false;
if(navigator.userAgent.toLowerCase().lastIndexOf("opera")!=-1){
    OPERA = true;
}
/**
 * If there is no Connector instance this method must be called before using monitor.
 */
BNCConnectorMonitor.start = function(){
	if(window.DISABLE_MONITOR){
		return false;
	}
	if(!getCookie(MULTICAST_PACKET)|| getCookie(MULTICAST_PACKET)=='' || getCookie(MULTICAST_PACKET)==null){
		setMulticastPacket('',true);
	}
	// add old cookie cleanups!!!
	if(BNCConnectorMonitor.singleton){
		return BNCConnectorMonitor.singleton;
	}
	BNCConnectorMonitor.singleton = BNCConnectorMonitor;

	setAllMCPByName(getMulticastPacket(),1);

	this.stopped = false;

	var timestampAnnounce  = new Date().valueOf();
	var timestampClean = new Date().valueOf();

	var __ = function(){
		if(BNCConnectorMonitor.stopped){
			BNCConnectorMonitor.singleton=false;
			return;
		}
		var mcp = getMulticastPacket();
		if(BNCConnectorMonitor.isFreezed(mcp)!==false){
          //  console.log("Freezed state:");console.log(mcp);
			removeAllDeadMCP(mcp);
			mcp = getMulticastPacket();
			setAllMCPByName(mcp,0,BNCConnectorMonitor.localPeers,1);
		}
	};

	__();
	
	var announceR = 110, cleanR = 700;

	if(OPERA || window.ONUNLOAD_NOT_SUPPORTED){
		announceR = 30;
		cleanR = 110;
	}

	var _ = function(){
		//exit when stopped
		if(BNCConnectorMonitor.stopped) {
			BNCConnectorMonitor.singleton=false;
			return;
		}
		//check if deadlock
        var _packet = getPacket();
		var stamp = _packet[LED];
		if( _packet[RECEIVER] != "00" && (isNaN(stamp) || (stamp+PACKET_TIMEOUT*3) < new Date().valueOf()) ) {
          //console.log("Deadlock.");
          //console.log(getPacket()[RECEIVER]);
			setPacket(NULL_PACKET);
            log("Deadlock detected. Resetting.");
		}
		//routine check for dead peers
		if(!BNCConnectorMonitor.cleanDeadlocksOnly){
			var time = new Date().valueOf();
			//announce locals
			if( time - timestampAnnounce > announceR){
				BNCConnectorMonitor.announceAll();
				timestampAnnounce = new Date().valueOf();
			}
			//clean dead peers
			if( time - timestampClean > cleanR){
				__();
				timestampClean = new Date().valueOf();
			}
		}

		doTimeout(_,20);
	}

	_();

	var cleanWhenLeave = function(){
		for(var i=0;i<BNCConnectorMonitor.localPeers.length;i++){
			removeAllDeadMCP(getMulticastPacket(),BNCConnectorMonitor.localPeers[i]);
		}
	};
	var beforeU = window.onclose;
	var beforeBeforeU = window.onbeforeunload;

	var _beforeU = function(e){
		cleanWhenLeave();
		try{
			beforeU(e);
		}catch(ex){}
	};
	var _beforeBeforeU = function(e){
		cleanWhenLeave();
		try{
			beforeBeforeU(e);
		}catch(ex){}
	};
	if(!window.ONUNLOAD_NOT_SUPPORTED){
		var fr = document.createElement("iframe");
        fr.src = "about:blank";
		top.cleanUpBNCConnector = function(){
			cleanWhenLeave();
		};
		try {
			// make sure there will be extra on unload notifier (improvements);
			document.getElementsByTagName("body")[0].parentNode.appendChild(fr);
			fr.contentWindow.document.write("<script> window.onclose=function(){top.cleanUpBNCConnector();}; window.onunload=function(){top.cleanUpBNCConnector();}; window.onbeforeunload=function(){top.cleanUpBNCConnector();};</script>");
			fr.style.display = "none";
          fr.src = "about:blank";
			fr.contentWindow.onunload = top.cleanUpBNCConnector;
			fr.contentWindow.onbeforeunload = top.cleanUpBNCConnector;
			fr.contentWindow.onclose = top.cleanUpBNCConnector;
		} catch (exception) {
		}

		window.onunload = _beforeU;
		window.onbeforeunload = _beforeBeforeU;
	}
};

BNCConnectorMonitor.announceAll = function(){
	var packet = getMulticastPacket();
	var ret='';
	for(var i=0;i<BNCConnectorMonitor.localPeers.length;i++){
		var name = BNCConnectorMonitor.localPeers[i];
		setMCPInPacketByNameNoUpdate(packet,name,1);
	}
	ret=buildStringOfPacket(packet);
	setMulticastPacket(ret);
};

var FREEZE_TIMEOUT = 400;
if( OPERA || window.ONUNLOAD_NOT_SUPPORTED ){
	FREEZE_TIMEOUT = 120;
}
BNCConnectorMonitor.isFreezed = function(mcp){
	if( (isNaN(mcp[0]*1)) || ( mcp[0]*1>0 && (mcp[0]*1 + FREEZE_TIMEOUT) < new Date().valueOf() ) ){
		//console.log((mcp[0]*1 + 260) - new Date().valueOf());
		return true;
	}
	return false;
};

BNCConnectorMonitor.stop = function(){
	this.stopped = true;
};

/**
 * Gets all peers present in the network as an array.
 */
BNCConnectorMonitor.getAllPeers = function (){
	var packet = getMulticastPacket();
	var ret = [];
	var len = packet[2].length;
	for(var i=0;i<len;i++){
		ret[i] = packet[2][i][0];
	}
	for(var j=0;j<BNCConnectorMonitor.localPeers.length;j++){
		var isIn = false;
		for(var i=0;i<len;i++){
			if( ret[i] == BNCConnectorMonitor.localPeers[j] ){
				isIn = true;
				break;
			}
		}
		if(!isIn){
			ret.push(BNCConnectorMonitor.localPeers[j]);
		}
	}
	
	return ret;
};

BNCConnectorMonitor.register = function(name){
	BNCConnectorMonitor.localPeers.push(name);
	BNCConnectorMonitor.announceAll();
};
/**
 * Use if you want to announce dead peer using its NAME/IP.
 * May be usefull if you take control over unloading events or do unstable iframe or window operations.
 * Monitor (when enabled (default) will still detect dead peers (in short time).
 */
BNCConnectorMonitor.unregister=function(name){
	for(var i=0;i<BNCConnectorMonitor.localPeers.length;i++){
		if(BNCConnectorMonitor.localPeers[i]==name){
			BNCConnectorMonitor.localPeers.splice(i,1);
		}
	}
	removeAllDeadMCP(getMulticastPacket(),name);
}

BNCConnectorMonitor.localPeers=[];
window.BNCConnectorMonitor = BNCConnectorMonitor;

	/*
 * ===============================================================================
 *
 * 	Copyright 2011 @ Piotr (Peter) Fronc (theprivateland.com)
 *
 *     This file is part of BNCConnector project.
 *
 *     BNCConnector is free software: you can redistribute it and/or modify
 *     it under the terms of the Lesser GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     BNCConnector is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     Lesser GNU General Public License for more details.
 *
 *     You should have received a copy of the Lesser GNU General Public License.
 *     If not, see <http://www.gnu.org/licenses/>.
 *
 * ===============================================================================
 */
window.DISABLE_MONITOR=false;
/**
 * @class BNCConnector
 * Class used to create connector instance. In general you will use only one per browser window instance (or more if you need).
 * Because of performance limitations (famous IE stuff) you may want to have lesser amount of connectors if you extensively use BNCMonitor (enabled by default).
 * IP parameter (connector name) should be UNIQUE, and for local peers
 * Connector will not allow to create one with same IP. You can use monitor to check IP taken already. In fact it's always better to know IP for your instance.
 * BNCConnector will enable monitor by default UNLESS window.DISABLE_MONITOR property is set to true.
 * @param name custom Ip address name, by default it must be 2 characters with exception of 00 (zero zero).
 * If name/IP will be longer than accepted it will be truncated.
 */
var BNCConnector = function(name){
	this.data = [];
	if(name.length>IP_LIMIT) {
		throw "Name cannot be longer than "+IP_LIMIT+" characters";
	}
	var len = name.length;
	for(var i=0;i<IP_LIMIT-len;i++){
		name=name+'_';
	}
	for(var i=0;i<BNCConnector.PEERS.length;i++){
		if(BNCConnector.PEERS[i]==name){
			throw "This IP is in use locally!";
		}
	}
	this.name = name;
	this.init();
	this.BUSY=false;
	this.current =false;
	this.message='';
	BNCConnectorMonitor.start();
	BNCConnectorMonitor.register(this.name);
	BNCConnector.PEERS.push(this.name);

};
BNCConnector.PEERS = [];
/**
 * Gets all currently registered peers in the network.
 * @return array of IP addresses
 */
BNCConnector.prototype.getAllPeers = function (){
	var packet = getMulticastPacket();
	var ret = [];
	var len = packet[2].length;
	for(var i=0;i<len;i++){
		ret[i] = packet[2][i][0];
	}
	return ret;
}
/**
 * @private Initialization method.
 */
BNCConnector.prototype.init=function(){
	if(getPacket()[SENDER] == this.name){
		setPacket(NULL_PACKET);
	}
	this.process();
}
/**
 * @private Packet reading processor.
 */
BNCConnector.prototype.checkPacket=function(){
	if(this.destroyed) return null;
	if(this.check_locked) return null;
	this.check_locked = true;

	var _this = this;
	var p = getPacket();

	if ( p[RECEIVER]==this.name ) {
		if(p[DONE]){
			try{
				setPacket(NULL_PACKET);
				this.recived_timestamp = false;
              if(this.message === null){
                    this.onerror('null message',this.last_packet);
              }else{
                    this.listen(p[SENDER],this.message);
              }
			}catch(ex){
			}
			this.message='';
		}else if( !p[RECEIVED] ) {
			if(p[DATA].charAt(0) == '1'){
				this.message='';
			}

			this.message+=p[DATA].substring(1,p[DATA].length);
			setPacket(p[RECEIVER]+'110'+p[SENDER]+p[DATA]);
			this.recived_timestamp = new Date().valueOf();
			this.check_locked = false;
			doTimeout(function(){
				_this.checkPacket();
			},TRANSMIT_DTIME);
		}
	} else if( p[RECEIVER] ) {

	}
	this.check_locked = false;
	return [p,false];
}
/**
 * Handler for incoming messages.
 * When you create instance var ins = new BNCConnector("xx"); ins.listen will be called always when full message has been received.
 * @param sender String containing sender IP
 * @param msg String - the incoming message.
 */
BNCConnector.prototype.listen=function(sender,msg){}
/**
 * Function to queue message to desired receiver, broken receivers (example: browser closed) will force BNCMonitor to dump the message.
 * Use this function to send messages to other peers, iof used multiple, messages will be queued.
 * @param receiver String - receivers IP
 * @param string String - the string message to send
 */
BNCConnector.prototype.sendData=function(receiver,string){
	if(this.destroyed)return;
	this.pushPackets(string,receiver);
}
/**
 * @private
 */
BNCConnector.prototype.TRANSMIT_CHUNK = 0;
/**
 * @private
 */
BNCConnector.prototype.transmit = function(p){
	if(	window.interrupt ||	(this.current_sent_not &&
		((this.current_sent_not + PACKET_TIMEOUT )  < new Date().valueOf()))){
		try{
			if(window.interrupt){
                this.onerror('interrupted',this.last_packet);
            }else{
                //console.log("timed->"+ (new Date().valueOf() - this.current_sent_not));
                this.onerror('timedout: either peer does not exist or cookie try lower packet size on cookie setting.',this.last_packet);
                //setPacket(NULL_PACKET);
                //console.log( getPacket() );
            }
			//setPacket(NULL_PACKET);
			//BNCConnectorMonitor.killIPByName(p[RECEIVER]);
		}catch(ex){}
		this.current=false;
		this.not_finished=false;
		this.current_sent_not = false;
		window.interrupt = false;
	}

	var data = this.current;
	var _this = this;

	if( p[BUSY] && (p[SENDER] != this.name) ){
		return false;
	}

	if(data){
		if( p[RECEIVED] && p[SENDER]==this.name ){
			if( !data[0][0] ){
				this.onsent(this.last_packet);
				this.last_packet=[];
				setPacket(data[1]+'101'+this.name+p[DATA]);
				this.current=false;
				doTimeout(function(){
					_this.not_finished=false;
				},MAX_WAIT* (0.5+(Math.random()*0.5)) );
			}else{
				setPacket(data[1]+'100'+this.name+data[0][0]);
				data[0].splice(0,1);
			}
			this.current_sent_not = false;
		}else if( !this.current_sent_not ){
			this.current_sent_not = new Date().valueOf();
			setPacket(data[1]+'100'+this.name+data[0][0]);
			data[0].splice(0,1);
		}
	}else{
		return false;
	}
	return true;
}
/**
 * When message sending error occured this method will be called.
 * In general: when during sending transfer will be interrupted or peer lost/doesnt exist - this method will be called.
 * @param errorCode error type
 * @param data Array:  [String message that was supposed to be sent,receiver IP ]
 */
BNCConnector.prototype.onerror = function (errorCode,data){}
/**
 * Called when message was succesively sent.
 * @param data Array:  [String message that was supposed to be sent,receiver IP ]
 */
BNCConnector.prototype.onsent = function (msg){}
BNCConnector.prototype.TMP_STACK=[];
/**
 * @private
 */
BNCConnector.prototype.process=function(){
	if(this.destroyed)return;
	var _this=this;
	var p = this.checkPacket()[0];
	if( !this.not_finished ) if ( (!this.current) && (this.data[0]) ) {
		this.not_finished = true;
		this.current = this.data[0];
		this.last_packet = [this.data[0][0]+'',this.data[0][1]+''];
       //console.log("inserting data ");console.log(this.last_packet);
		this.data.splice(0,1);
	}
	var state = this.transmit(p);
	if( !state ){
		doTimeout(function(){
			_this.process();
		},MAX_WAIT);
	}else{
		doTimeout(function(){
			_this.process();
		},TRANSMIT_DTIME);
	}
}
/**
 * @private
 */
BNCConnector.prototype.pushPackets=function(string,receiver){
	var ps = PACKET_SIZE -1 ;
	var it = Math.floor(string.length / ps) +1;
	var packets = [];
	var start = 1;
	for(var i=0;i<it;i++){
		packets.push( start + string.substring( i*ps, (i+1)*ps) );
		start = 0;
	}
	this.data.push([packets,receiver]);
}
/**
 * Call to close/kill connector.
 */
BNCConnector.prototype.destroy=function(){
	BNCConnectorMonitor.unregister(this.name);
	for(var i=0;i<BNCConnector.PEERS.length;i++){
		if(BNCConnector.PEERS[i]==this.name){
			BNCConnector.PEERS.splice(i,1);
		}
	}
	this.destroyed = true;
}
window.BNCConnector = BNCConnector;
})();