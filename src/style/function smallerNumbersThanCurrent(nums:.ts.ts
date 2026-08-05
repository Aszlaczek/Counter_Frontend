function smallerNumbersThanCurrent(nums: number[]): number[] {
  let counter = 0;
  let list_out = [];
  for (let i = 0; i < nums.length; i++) {
    let number = nums[i];
    for (let j = 0; j < nums.length; j++) {
      if (number !== nums[j] && number > nums[j]) counter += 1;
    }
    list_out.push(counter);
  }
  counter = 0;
  return list_out;
}

const nums = [8, 1, 2, 2, 3];
console.log(smallerNumbersThanCurrent(nums));
