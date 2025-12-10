import React from "react";

type Props = {
	className?: string;
};

const FacebookLogoWhite = (props: Props) => {
	return (
		<svg
			width="36"
			height="37"
			viewBox="0 0 36 37"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={props.className}>
			<path
				d="M27 3.25H22.5C20.5109 3.25 18.6032 4.04018 17.1967 5.4467C15.7902 6.85322 15 8.76088 15 10.75V15.25H10.5V21.25H15V33.25H21V21.25H25.5L27 15.25H21V10.75C21 10.3522 21.158 9.97064 21.4393 9.68934C21.7206 9.40804 22.1022 9.25 22.5 9.25H27V3.25Z"
				stroke="white"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default FacebookLogoWhite;
