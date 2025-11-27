const useFormatter = () => {
	const simplifyArray = (arr) => {
		let array = arr?.map((item) => {
			return {
				ramo: item?.Ramo.split(' ')[0],
				ur: item?.Unidad.split(' ')[0],
				codigo_presupuestal: item['Descripción'].split(' ')[0],
				nivel_tabular: item?.Nivel.split(' ')[0],
			};
		});
		return array;
	};

	const arrayToJSON = (arr) => {
		let array = simplifyArray(arr);
		let final = array.reduce((acc, current) => {
			let index = acc?.findIndex((item) => item?.ramo === current?.ramo && item?.ur === current.ur);
			if (index === -1) {
				acc.push({
					ramo: current.ramo,
					ur: current.ur,
					codigos: [{ codigo_presupuestal: current.codigo_presupuestal, nivel_tabular: current.nivel_tabular }],
				});
			} else {
				acc[index]?.codigos.push({ codigo_presupuestal: current.codigo_presupuestal, nivel_tabular: current.nivel_tabular });
			}
			return acc;
		}, []);
		return final;
	};

	return arrayToJSON;
};

export default useFormatter;
