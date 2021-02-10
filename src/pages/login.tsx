import React from "react";
import { Form, Formik } from "formik";
import {
 Button,
  Box,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
interface registerProps {}

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="regular">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }): Promise<any> => {
          const response = await login({options : values});
          if (response.data?.login?.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={8}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Box mt={8}>
              <Button
                type="submit"
                colorScheme="orange"
                isLoading={isSubmitting}
              >
               Log IN
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default Login;
