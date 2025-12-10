import React from "react";

type Props = {
	className?: string;
};

const TwitterLogoWhite = (props: Props) => {
	return (
		<svg
			width="36"
			height="37"
			viewBox="0 0 36 37"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={props.className}>
			<path
				d="M34.5 4.74946C33.0636 5.76267 31.4732 6.53762 29.79 7.04446C28.8866 6.00572 27.686 5.2695 26.3506 4.93535C25.0151 4.6012 23.6092 4.68525 22.3231 5.17614C21.037 5.66703 19.9327 6.54106 19.1595 7.68003C18.3863 8.81901 17.9815 10.168 18 11.5445V13.0445C15.364 13.1128 12.7519 12.5282 10.3965 11.3426C8.04112 10.1571 6.01548 8.40741 4.5 6.24946C4.5 6.24946 -1.5 19.7495 12 25.7495C8.91079 27.8464 5.23074 28.8979 1.5 28.7495C15 36.2495 31.5 28.7495 31.5 11.4995C31.4986 11.0816 31.4584 10.6649 31.38 10.2545C32.9109 8.7447 33.9912 6.83853 34.5 4.74946V4.74946Z"
				stroke="white"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default TwitterLogoWhite;
