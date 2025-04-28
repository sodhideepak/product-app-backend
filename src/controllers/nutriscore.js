          
function calculateNutriScore(kcal, carbs, fats, protein, sodium,fruitsVegetablesPercentage,fiber,category_to_check) {
    // Convert kcal to kJ (1 kcal = 4.184 kJ)
    let energy = kcal ;
    // console.log(category_to_check);
    // let energy = kcal * 0; 
    let negativePoints;
    let category = ['beverage','diary','juice'];
    if (category.includes(category_to_check)) {
        // console.log("in the beverage");
        
        
         negativePoints = {
        
            energy: [
                { threshold: 0, points: 0 },
                { threshold: 7.2, points: 1 },
                { threshold: 14.3, points: 2 },
                { threshold: 21.5, points: 3 },
                { threshold: 28.5, points: 4 },
                { threshold: 35.9, points: 5 },
                { threshold: 43.0, points: 6 },
                { threshold: 50.2, points: 7 },
                { threshold: 57.4, points: 8 },
                { threshold: 64.5, points: 9 },
                { threshold: Infinity, points: 10 }
            ],
            sugars: [
                { threshold: 0, points: 0 },
                { threshold: 1.5, points: 1 },
                { threshold: 3.0, points: 2 },
                { threshold: 4.5, points: 3 },
                { threshold: 6.0, points: 4 },
                { threshold: 7.5, points: 5 },
                { threshold: 9.0, points: 6 },
                { threshold: 10.5, points: 7 },
                { threshold: 12, points: 8 },
                { threshold: 13.5, points: 9 },
                { threshold: Infinity, points: 10 }
            ],
            saturatedFat: [
                { threshold: 1, points: 0 },
                { threshold: 2, points: 1 },
                { threshold: 3, points: 2 },
                { threshold: 4, points: 3 },
                { threshold: 5, points: 4 },
                { threshold: 6, points: 5 },
                { threshold: 7, points: 6 },
                { threshold: 8, points: 7 },
                { threshold: 9, points: 8 },
                { threshold: 10, points: 9 },
                { threshold: Infinity, points: 10 }
            ],
            sodium: [
                { threshold: 90, points: 0 },
                { threshold: 180, points: 1 },
                { threshold: 270, points: 2 },
                { threshold: 360, points: 3 },
                { threshold: 450, points: 4 },
                { threshold: 540, points: 5 },
                { threshold: 630, points: 6 },
                { threshold: 720, points: 7 },
                { threshold: 810, points: 8 },
                { threshold: 900, points: 9 },
                { threshold: Infinity, points: 10 }
            ]
        };
    } else {
        // console.log("nonbeverage");
        
         negativePoints = {
        
            energy: [
                { threshold: 80, points: 0 },
                { threshold: 160, points: 1 },
                { threshold: 240, points: 2 },
                { threshold: 320, points: 3 },
                { threshold: 400, points: 4 },
                { threshold: 480, points: 5 },
                { threshold: 560, points: 6 },
                { threshold: 640, points: 7 },
                { threshold: 720, points: 8 },
                { threshold: 800, points: 9 },
                { threshold: Infinity, points: 10 }
            ],
            sugars: [
                { threshold: 4.5, points: 0 },
                { threshold: 9, points: 1 },
                { threshold: 13.5, points: 2 },
                { threshold: 18, points: 3 },
                { threshold: 22.5, points: 4 },
                { threshold: 27, points: 5 },
                { threshold: 31, points: 6 },
                { threshold: 36, points: 7 },
                { threshold: 40, points: 8 },
                { threshold: 45, points: 9 },
                { threshold: Infinity, points: 10 }
            ],
            saturatedFat: [
                { threshold: 1, points: 0 },
                { threshold: 2, points: 1 },
                { threshold: 3, points: 2 },
                { threshold: 4, points: 3 },
                { threshold: 5, points: 4 },
                { threshold: 6, points: 5 },
                { threshold: 7, points: 6 },
                { threshold: 8, points: 7 },
                { threshold: 9, points: 8 },
                { threshold: 10, points: 9 },
                { threshold: Infinity, points: 10 }
            ],
            sodium: [
                { threshold: 90, points: 0 },
                { threshold: 180, points: 1 },
                { threshold: 270, points: 2 },
                { threshold: 360, points: 3 },
                { threshold: 450, points: 4 },
                { threshold: 540, points: 5 },
                { threshold: 630, points: 6 },
                { threshold: 720, points: 7 },
                { threshold: 810, points: 8 },
                { threshold: 900, points: 9 },
                { threshold: Infinity, points: 10 }
            ]
        };
    }

    // Define thresholds for negative points
    // const negativePoints = {

    //     energy: [
    //         { threshold: 80, points: 0 },
    //         { threshold: 160, points: 1 },
    //         { threshold: 240, points: 2 },
    //         { threshold: 320, points: 3 },
    //         { threshold: 400, points: 4 },
    //         { threshold: 480, points: 5 },
    //         { threshold: 560, points: 6 },
    //         { threshold: 640, points: 7 },
    //         { threshold: 720, points: 8 },
    //         { threshold: 800, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ],
    //     sugars: [
    //         { threshold: 4.5, points: 0 },
    //         { threshold: 9, points: 1 },
    //         { threshold: 13.5, points: 2 },
    //         { threshold: 18, points: 3 },
    //         { threshold: 22.5, points: 4 },
    //         { threshold: 27, points: 5 },
    //         { threshold: 31, points: 6 },
    //         { threshold: 36, points: 7 },
    //         { threshold: 40, points: 8 },
    //         { threshold: 45, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ],
    //     saturatedFat: [
    //         { threshold: 1, points: 0 },
    //         { threshold: 2, points: 1 },
    //         { threshold: 3, points: 2 },
    //         { threshold: 4, points: 3 },
    //         { threshold: 5, points: 4 },
    //         { threshold: 6, points: 5 },
    //         { threshold: 7, points: 6 },
    //         { threshold: 8, points: 7 },
    //         { threshold: 9, points: 8 },
    //         { threshold: 10, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ],
    //     sodium: [
    //         { threshold: 90, points: 0 },
    //         { threshold: 180, points: 1 },
    //         { threshold: 270, points: 2 },
    //         { threshold: 360, points: 3 },
    //         { threshold: 450, points: 4 },
    //         { threshold: 540, points: 5 },
    //         { threshold: 630, points: 6 },
    //         { threshold: 720, points: 7 },
    //         { threshold: 810, points: 8 },
    //         { threshold: 900, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ]
    // };

    // Define thresholds for positive points
    const positivePoints = {
        fruitsVegetables: [
            { threshold: 40, points: 0 },
            { threshold: 60, points: 1 },
            { threshold: 80, points: 2 },
            { threshold: Infinity, points: 3 }
        ],
        fiber: [
            { threshold: 0.9, points: 0 },
            { threshold: 1.9, points: 1 },
            { threshold: 2.8, points: 2 },
            { threshold: 3.7, points: 3 },
            { threshold: 4.7, points: 4 },
            { threshold: Infinity, points: 5 }
        ],
        protein: [
            { threshold: 1.6, points: 0 },
            { threshold: 3.2, points: 1 },
            { threshold: 4.8, points: 2 },
            { threshold: 6.4, points: 3 },
            { threshold: 8, points: 4 },
            { threshold: Infinity, points: 5 }
        ]
    };
// console.log(thresholds)
// console.log(thresholds.length)
    // Calculate negative points
    function getPoints(value, thresholds) {
        
        for (let i = 0; i < thresholds.length; i++) {
            if (value <= thresholds[i].threshold) {
                // console.log(thresholds[i].points);
                return thresholds[i].points;
            }
        }
    }

// console.log(getPoints(energy, negativePoints.energy), 
// getPoints(carbs, negativePoints.sugars) ,
// getPoints(fats, negativePoints.saturatedFat), 
// getPoints(sodium, negativePoints.sodium))



    let negativeScore = getPoints(energy, negativePoints.energy) +
                        getPoints(carbs, negativePoints.sugars) +
                        getPoints(fats, negativePoints.saturatedFat) +
                        getPoints(sodium, negativePoints.sodium);

    // For the example, let's assume 0% fruits/vegetables and fiber as we don't have those values
    // let fruitsVegetablesPercentage = 19.5;
    // let fiber = 0;

    // console.log("1",fruitsVegetablesPercentage);
    // console.log("2",fiber);
    // console.log("3",protein); 

    let positiveScore = getPoints(fruitsVegetablesPercentage, positivePoints.fruitsVegetables) +
                        getPoints(fiber, positivePoints.fiber) +
                        getPoints(protein, positivePoints.protein);

    // Calculate final score    
    // console.log(negativeScore);
    // console.log(positiveScore);
    let finalScore = negativeScore - positiveScore;

    // Determine Nutri-Score
    let nutriScore;
    if (finalScore <= -1) {
        nutriScore = 'A';
    } else if (finalScore <= 2) {
        nutriScore = 'B';
    } else if (finalScore <= 10) {
        nutriScore = 'C';
    } else if (finalScore <= 18) {
        nutriScore = 'D';
    } else {
        nutriScore = 'E';
    }

    return { finalScore, nutriScore };
}

