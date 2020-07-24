module.exports = {
	["RandomNum"]: function (Minumum, Maximum) {
		return Math.random() * (Maximum - Minumum) + Minumum;
	},

	["RandomInt"]: function (Minimum, Maximum) {
		Minimum = Math.ceil(Minimum);
		Maximum = Math.floor(Maximum);
		return Math.floor(Math.random() * (Maximum - Minimum + 1)) + Minimum;
	},

	["RandomString"]: function (Length = 16, CharacterSet = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`) { // Random string
		var Result = "";
		for (var i = 0; i < Length; i++)
			Result += CharacterSet.charAt(this.RandomInt(0, CharacterSet.length - 1));
		return Result;
	},

	["RandomUUID"]: function () { // Random UUID
		var Idx1 = this.RandomString(8);
		var Idx2 = this.RandomString(4);
		var Idx3 = this.RandomString(4);
		var Idx4 = this.RandomString(4);
		var Idx5 = this.RandomString(12);
		return `${Idx1}-${Idx2}-${Idx3}-${Idx4}-${Idx5}`;
	},

	["RandomCUUID"]: function (...Chunks) {
		var CUUID = [];
		for (var i = 0; i < Chunks.length; i++)
			CUUID.push(this.RandomString(Chunks[i]));
		return CUUID.join("-");
	}
};