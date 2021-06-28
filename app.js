let fs = require('fs');
//set to True to enable console log for debugging
let testmode = false;

var dustCollected = 0;
var roomWidth;
var roomLength;
var roomSize;
var room;
var vacuumPosition;
var lineCounter;
var moves;

//file name & path is hardcoded as input.txt as per instructions.
fs.readFile('input.txt', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	} 
	
	if (testmode) {
		console.log('Input file readout:' + '\n' + data);	
		console.log('\n');
	}

	// Create array with first line input. 
	// Design decision made to use 1D flat array instead of 2D nested array for simplicity and scalability
	// A room with the following dimension:
	// ____________
	// |6 | 7 | 8 |
	// |3 | 4 | 5 |
	// |0 | 1 | 2 |
	// ⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻
	// is laid out in the following 1D array:
	// array = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	// 
	// The value on each object of the array indicates if there the spot is empty of filled.
	// 0 = empty
	// 1 = dust
	// 2 = vacuum

	let arrayOfInput = data.split("\r\n");

	createRoom(arrayOfInput[0]);
	
	if (testmode) {
		console.log('Room Width: ' + roomWidth);
		console.log('Room Length: ' + roomLength);		
		console.log('Room initialized: ' + room);
		console.log('\n');
	}


	setVacuumPosition(arrayOfInput[1]);

	if (testmode) {
		console.log('Vacuum Position: ' + vacuumPosition);
		console.log('Updated Room State w/ Vacuum: ' + room);
		console.log('\n');
	}

	setDustPosition(arrayOfInput);

	if (testmode) {
		console.log('Updated Room State w/ Dust: ' + room);
		console.log('\n');
	}

	setMoves(arrayOfInput);

	if (testmode) {
		console.log('Moves: ' + moves);
		console.log('\n');
	}


	processMoves(moves);


	process.stdout.write(convertPositionToCoodrinate(vacuumPosition));
	process.stdout.write("\n");
	process.stdout.write(String(dustCollected));


});


//Room Object

function createRoom(roomDimensions) {
	let lineItems = roomDimensions.split(" ");
	// NOTE: Width and Length needs to be set before isPositionValid
	// These values will still be checked using for isPositionValid
	roomWidth = Number(lineItems[0]);
	roomLength = Number(lineItems[1]);


	//line is valid if line has 2 numbers
	if (isRoomDimensionsValid(lineItems)) {
		//Initialize room
		roomSize = roomWidth * roomLength;
		room = new Array(roomSize);

		// initialize entire room with 0s to indicate they are empty
		for (var i = 0; i < room.length; i++) {
			room[i] = 0;
		}
	} else {
		throw new Error("Room Dimensions Invalid");
	}
}

function isRoomDimensionsValid(lineItem) {
	// Must be exactly 2 non-negative numbers
	if (lineItem.length = 2 && 
		Number.isInteger(Number(lineItem[0])) &&
		lineItem[0] >= 0 && 
		Number.isInteger(Number(lineItem[1])) &&
		lineItem[1] >= 0) {
		return true;
	} else {
		return false;
	}
}


//Vacuum Object

function setVacuumPosition(vacuumInput) {
	let lineItems = vacuumInput.split(" ");
	//set variable for easy access

	if (isPositionValid(lineItems)) {
		let lineItems = vacuumInput.split(" ");
		vacuumPosition = Number(lineItems[0]) + (Number(lineItems[1]) * roomWidth);
		// update room with vacuum position
		room[vacuumPosition] = 2;
	} else {
		throw new Error("Vacuum Position Invalid");
	}

}

function updateVacuum(newPosition){
	room[vacuumPosition] = 0;
	room[newPosition] = 2;
	vacuumPosition = newPosition;
}

//Dust Object

function setDustPosition(arr) {
	//loop through all numeric lines starting line 3
	//end loop after move directions
	for (var i = 2; arr.length; i++){
		lineCounter = i;

		if(!arr[i]) {
			lineCounter++;
			throw new Error("Error parsing line" + lineCounter);
		}

		if (isPositionValid(arr[i].split(" "))) {
			let lineItems = arr[i].split(" ");
			let dustPosition = Number(lineItems[0]) + (Number(lineItems[1]) * roomWidth);	
			// update room with dust position
			room[dustPosition] = 1;
		} else {
			let lineItems = arr[i].split(" ");

			// if line is only NWSE, continue to process moves, otherwise there is something wrong with data. 
			// Unsure if this line is food or moves, so generic error instead.
			if (/^[NnWwSsEe]+$/.test(lineItems)) {
				break;
			} else {
				lineCounter++;
				throw new Error("Error parsing line" + lineCounter);
			}
		}
	}

}

function cleanDust(newPosition){
	if (room[newPosition] == 1){
		dustCollected++;
		if (testmode) console.log("Dust Collected on array position " + newPosition);
	}
}

//Moves Handler

function setMoves(arr) {
	// save moves in all caps for ease of use.
	// validation checks happen when parsing each move
	moves = arr[lineCounter];
	moves = moves.toUpperCase();
}

function processMoves(moves){
	var newPosition;
	for (var i = 0; i < moves.length; i++) {
		switch(moves[i]) {
			case "N":		
				if (testmode) console.log("Move North.");
				// moving North is the same as incrementing array position by roomWidth
				newPosition = vacuumPosition + roomWidth;

				// vacuum is against Northh wall when NEW position is greater than room size
				// clean dust if applicable, update old position and new position (room & helper variable);
				if (newPosition <= roomSize){
					cleanDust(newPosition);
					updateVacuum(newPosition);
				} else {
					if (testmode) console.log("Hit North Wall");
				}
				
				break;

			case "S":
				if (testmode) console.log("Move South.");
				// moving South is the same as decrementing array position by roomWidth				
				newPosition = vacuumPosition - roomWidth;

				// vacuum is against South wall when NEW position is less than 0
				// clean dust if applicable, update old position and new position (room & helper variable);
				if (newPosition >= 0){
					cleanDust(newPosition);
					updateVacuum(newPosition);
				} else {
					if (testmode) console.log("Hit South Wall");
				}

				break;

			case "W":
				if (testmode) console.log("Move West.");
				// moving W is the same as decrementing array position by 1				
				newPosition = vacuumPosition - 1;

				// vacuum is against West wall when CURRENT position is multiple of roomWidth
				// clean dust if applicable, update old position and new position (room & helper variable);
				if (vacuumPosition % roomWidth != 0){
					cleanDust(newPosition);
					updateVacuum(newPosition);
				} else {
					if (testmode) console.log("Hit West Wall");
				}

				break;

			case "E":
				if (testmode) console.log("Move East.");
				// moving E is the same as incrementing array position by 1
				newPosition = vacuumPosition + 1;

				// vacuum is against East wall when NEW position is multiple of roomWidth
				// clean dust if applicable, update old position and new position (room & helper variable);
				if (newPosition % roomWidth != 0){
					cleanDust(newPosition);
					updateVacuum(newPosition);
				} else {
					if (testmode) console.log("Hit East Wall");
				}
				break;

			default:
				throw new Error("Invalid Move Set");
				break;
		}
	}
}



// Position Handler
function isPositionValid(lineItem){
	// Must be exactly 2 non-negative numbers and within the length/width of room.
	// NOTE: roomLenth and Width and decremented since array position starts at 0 not 1.
	if (lineItem.length = 2 && 
		Number.isInteger(Number(lineItem[0])) &&
		lineItem[0] >= 0 && 
		lineItem[0] <= roomWidth - 1 &&
		Number.isInteger(Number(lineItem[1])) &&
		lineItem[1] >= 0 &&
		lineItem[1] <= roomLength - 1) {
		return true;
	} else {
		return false;
	}
}

function convertPositionToCoodrinate(position){
	var x = position % roomWidth;
	var y = Math.floor(position / roomWidth);
	return (x + " " + y);

}